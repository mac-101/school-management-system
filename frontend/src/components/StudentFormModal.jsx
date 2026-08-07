import { useEffect, useState } from "react";
import axios from "axios";
import { formatCurrency } from "../utils/formatCurrency";

const GRADE_OPTIONS = {
  Primary: [1, 2, 3, 4, 5],
  JSS: [1, 2, 3],
  SSS: [1, 2, 3],
};

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  age: "",
  gender: "Male",
  level: "",
  grade: "",
  student_fee: "",
  amount_paid: "",
};

function toFormState(student) {
  if (!student) return { ...EMPTY_FORM };
  return {
    first_name: student.first_name ?? "",
    last_name: student.last_name ?? "",
    age: student.age ?? "",
    gender: student.gender ?? "Male",
    level: student.level ?? "",
    grade: student.grade ?? "",
    student_fee: student.student_fee ?? "",
    amount_paid: student.amount_paid ?? "",
  };
}

function validate(form) {
  const errors = {};
  if (!form.first_name.trim()) errors.first_name = "First name is required.";
  if (!form.last_name.trim()) errors.last_name = "Last name is required.";
  if (!form.age || Number(form.age) <= 0) errors.age = "Age must be greater than 0.";
  if (!form.level) errors.level = "Level is required.";
  if (!form.grade) errors.grade = "Grade is required.";
  if (form.student_fee === "" || Number(form.student_fee) < 0)
    errors.student_fee = "Student fee must be 0 or more.";
  if (form.amount_paid === "" || Number(form.amount_paid) < 0)
    errors.amount_paid = "Amount paid must be 0 or more.";
  return errors;
}

/**
 * Add/Edit Student modal. Pass `student` to open in edit mode (pre-filled,
 * PUT on submit) — omit it (or pass null) to open in create mode (POST).
 */
export default function StudentFormModal({ open, student, onClose, onSaved }) {
  const isEditMode = Boolean(student);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [visible, setVisible] = useState(false); // drives the enter/exit animation

  // Reset the form whenever the modal is opened, and drive the fade+scale in.
  useEffect(() => {
    if (open) {
      setForm(toFormState(student));
      setErrors({});
      setSubmitError(null);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [open, student]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const gradeOptions = form.level ? GRADE_OPTIONS[form.level] : [];
  const feeBalance = Number(form.student_fee || 0) - Number(form.amount_paid || 0);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      // Changing level invalidates whatever grade was picked for the old level.
      if (field === "level") return { ...prev, level: value, grade: "" };
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      age: Number(form.age),
      gender: form.gender,
      level: form.level,
      grade: Number(form.grade),
      student_fee: Number(form.student_fee),
      amount_paid: Number(form.amount_paid),
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      if (isEditMode) {
        await axios.put(`${baseUrl}students/${student.id}/`, payload);
      } else {
        await axios.post(`${baseUrl}students/`, payload);
      }
      onSaved(isEditMode ? "Student updated successfully." : "Student created successfully.");
    } catch (err) {
      setSubmitError("Could not save student. Please check the form and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[700px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl transition-all duration-200 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEditMode ? "Edit Student" : "Add Student"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          {submitError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {submitError}
            </div>
          )}

          {/* Personal Information */}
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-slate-600 mb-1">First Name</label>
              <input
                type="text"
                value={form.first_name}
                onChange={handleChange("first_name")}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              />
              {errors.first_name && (
                <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={handleChange("last_name")}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              />
              {errors.last_name && (
                <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Age</label>
              <input
                type="number"
                min="0"
                value={form.age}
                onChange={handleChange("age")}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              />
              {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={handleChange("gender")}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Academic Information */}
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Academic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Level</label>
              <select
                value={form.level}
                onChange={handleChange("level")}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              >
                <option value="">Select level</option>
                <option value="Primary">Primary</option>
                <option value="JSS">JSS</option>
                <option value="SSS">SSS</option>
              </select>
              {errors.level && <p className="text-xs text-red-600 mt-1">{errors.level}</p>}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Grade</label>
              <select
                value={form.grade}
                onChange={handleChange("grade")}
                disabled={!form.level}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Select grade</option>
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.grade && <p className="text-xs text-red-600 mt-1">{errors.grade}</p>}
            </div>
          </div>

          {/* Financial Information */}
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Financial Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Student Fee</label>
              <input
                type="number"
                min="0"
                value={form.student_fee}
                onChange={handleChange("student_fee")}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              />
              {errors.student_fee && (
                <p className="text-xs text-red-600 mt-1">{errors.student_fee}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Amount Paid</label>
              <input
                type="number"
                min="0"
                value={form.amount_paid}
                onChange={handleChange("amount_paid")}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              />
              {errors.amount_paid && (
                <p className="text-xs text-red-600 mt-1">{errors.amount_paid}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Fee Balance</label>
              <input
                type="text"
                readOnly
                value={formatCurrency(feeBalance)}
                className={`w-full border border-slate-200 bg-slate-50 rounded-md px-3 py-2 text-sm font-medium ${
                  feeBalance > 0 ? "text-red-600" : "text-emerald-600"
                }`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0A2472] rounded-md hover:bg-[#0A2472]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Saving..."
                : isEditMode
                ? "Save Changes"
                : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
