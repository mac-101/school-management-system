import { useEffect, useState } from "react";
import axios from "axios";

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
  role: "Teacher",
  employment_type: "Full Time",
  phone_number: "",
  email: "",
  salary: "",
  date_employed: "",
  is_active: true,
};

function toFormState(member) {
  if (!member) return { ...EMPTY_FORM };
  return {
    first_name: member.first_name ?? "",
    last_name: member.last_name ?? "",
    age: member.age ?? "",
    gender: member.gender ?? "Male",
    role: member.role ?? "Teacher",
    employment_type: member.employment_type ?? "Full Time",
    phone_number: member.phone_number ?? "",
    email: member.email ?? "",
    salary: member.salary ?? "",
    date_employed: member.date_employed ?? "",
    is_active: member.is_active ?? true,
  };
}

function validate(form) {
  const errors = {};
  if (!form.first_name.trim()) errors.first_name = "First name is required.";
  if (!form.last_name.trim()) errors.last_name = "Last name is required.";
  if (!form.age || Number(form.age) <= 0) errors.age = "Age must be greater than 0.";
  if (!form.phone_number.trim()) errors.phone_number = "Phone number is required.";
  if (!form.role) errors.role = "Role is required.";
  if (!form.employment_type) errors.employment_type = "Employment type is required.";
  if (!form.date_employed) errors.date_employed = "Date employed is required.";
  if (form.salary === "" || Number(form.salary) < 0) errors.salary = "Salary must be 0 or more.";
  return errors;
}

export default function StaffFormModal({ open, member, onClose, onSaved }) {
  const isEditMode = Boolean(member);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [visible, setVisible] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isClassModerator, setIsClassModerator] = useState(false);
  const [classModerator, setClassModerator] = useState({ level: "", grade: "" });

  useEffect(() => {
    if (open) {
      setForm(toFormState(member));
      setErrors({});
      setSubmitError(null);
      setVisible(true);
      // initialize assignments and class moderator from member when editing
      if (member) {
        setAssignments(
          (member.assignments || []).map((a) => ({ id: a.id, subject: a.subject, level: a.level, grade: a.grade }))
        );
        if (member.class_moderator) {
          setIsClassModerator(true);
          setClassModerator({
            id: member.class_moderator.id,
            level: member.class_moderator.level || "",
            grade: member.class_moderator.grade || "",
          });
        } else {
          setIsClassModerator(false);
          setClassModerator({ level: "", grade: "" });
        }
      } else {
        setAssignments([]);
        setIsClassModerator(false);
        setClassModerator({ level: "", grade: "" });
      }
    } else {
      setVisible(false);
    }
  }, [open, member]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  // fetch subjects when modal opens
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    const fetchSubjects = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${baseUrl}subjects/`);
        if (mounted) setSubjects(res.data || []);
      } catch (err) {
        // ignore - leave subjects empty
      }
    };
    fetchSubjects();
    return () => (mounted = false);
  }, [open]);

  const handleChange = (field) => (e) => {
    const value = field === "is_active" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAssignmentChange = (index, field) => (e) => {
    const value = e.target.value;
    setAssignments((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addAssignment = () => setAssignments((prev) => [...prev, { subject: "", level: "Primary", grade: "" }]);
  const removeAssignment = (i) => setAssignments((prev) => prev.filter((_, idx) => idx !== i));

  const handleClassModeratorChange = (field) => (e) => {
    const value = e.target.value;
    setClassModerator((prev) => ({ ...prev, [field]: value }));
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
      role: form.role,
      employment_type: form.employment_type,
      phone_number: form.phone_number.trim(),
      email: form.email.trim(),
      salary: Number(form.salary),
      date_employed: form.date_employed,
      is_active: form.is_active,
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      let staffId = member?.id;
      if (isEditMode) {
        await axios.put(`${baseUrl}staff/${member.id}/`, payload);
      } else {
        const res = await axios.post(`${baseUrl}staff/`, payload);
        staffId = res.data?.id;
      }

      // handle teaching assignments: delete existing (if editing) then create new ones
      if (isEditMode && member?.assignments?.length) {
        for (const a of member.assignments) {
          try {
            await axios.delete(`${baseUrl}teaching-assignments/${a.id}/`);
          } catch (e) {
            // ignore individual delete errors
          }
        }
      }

      for (const a of assignments) {
        // skip empty rows
        if (!a.subject) continue;
        await axios.post(`${baseUrl}teaching-assignments/`, {
          teacher: staffId,
          subject: Number(a.subject),
          level: a.level,
          grade: Number(a.grade),
        });
      }

      // handle class moderator
      if (isClassModerator) {
        if (isEditMode && classModerator?.id) {
          // update existing
          await axios.put(`${baseUrl}class-moderators/${classModerator.id}/`, {
            teacher: staffId,
            level: classModerator.level,
            grade: Number(classModerator.grade),
          });
        } else {
          await axios.post(`${baseUrl}class-moderators/`, {
            teacher: staffId,
            level: classModerator.level,
            grade: Number(classModerator.grade),
          });
        }
      } else if (isEditMode && member?.class_moderator?.id) {
        // remove existing class moderator if unchecked
        try {
          await axios.delete(`${baseUrl}class-moderators/${member.class_moderator.id}/`);
        } catch (e) {
          // ignore
        }
      }

      onSaved(isEditMode ? "Staff updated successfully." : "Staff created successfully.");
    } catch (err) {
      setSubmitError("Could not save staff. Please check the form and try again.");
      console.error("StaffFormModal submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl transition-all duration-200 ${visible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">{isEditMode ? "Edit Staff" : "Add Staff"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          {submitError && (
            <div className="mb-4 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600">First Name</label>
              <input value={form.first_name} onChange={handleChange("first_name")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30" />
              {errors.first_name && <p className="mt-1 text-xs text-red-600">{errors.first_name}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Last Name</label>
              <input value={form.last_name} onChange={handleChange("last_name")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30" />
              {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Age</label>
              <input type="number" min="0" value={form.age} onChange={handleChange("age")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30" />
              {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Gender</label>
              <select value={form.gender} onChange={handleChange("gender")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Role</label>
              <select value={form.role} onChange={handleChange("role")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30">
                <option value="Teacher">Teacher</option>
                <option value="Principal">Principal</option>
                <option value="Vice Principal">Vice Principal</option>
                <option value="Bursar">Bursar</option>
                <option value="Secretary">Secretary</option>
                <option value="Librarian">Librarian</option>
                <option value="Lab Assistant">Lab Assistant</option>
                <option value="Security">Security</option>
                <option value="Cleaner">Cleaner</option>
                <option value="Other">Other</option>
              </select>
              {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Employment Type</label>
              <select value={form.employment_type} onChange={handleChange("employment_type")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30">
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
              </select>
              {errors.employment_type && <p className="mt-1 text-xs text-red-600">{errors.employment_type}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Phone Number</label>
              <input value={form.phone_number} onChange={handleChange("phone_number")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30" />
              {errors.phone_number && <p className="mt-1 text-xs text-red-600">{errors.phone_number}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Email</label>
              <input type="email" value={form.email} onChange={handleChange("email")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Salary</label>
              <input type="number" min="0" value={form.salary} onChange={handleChange("salary")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30" />
              {errors.salary && <p className="mt-1 text-xs text-red-600">{errors.salary}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Date Employed</label>
              <input type="date" value={form.date_employed} onChange={handleChange("date_employed")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30" />
              {errors.date_employed && <p className="mt-1 text-xs text-red-600">{errors.date_employed}</p>}
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.is_active} onChange={handleChange("is_active")} />
            Active employee
          </label>

          {/* Teaching assignments - only relevant for teachers */}
          {form.role === "Teacher" && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Teaching Assignments</h3>
              {assignments.map((a, idx) => (
                <div key={idx} className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-4 items-end">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Subject</label>
                    <select value={a.subject} onChange={handleAssignmentChange(idx, "subject")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                      <option value="">Select subject</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Level</label>
                    <select value={a.level} onChange={handleAssignmentChange(idx, "level")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                      <option value="Primary">Primary</option>
                      <option value="JSS">JSS</option>
                      <option value="SSS">SSS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Grade</label>
                    <select value={a.grade} onChange={handleAssignmentChange(idx, "grade")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                      <option value="">Select grade</option>
                      {(GRADE_OPTIONS[a.level] || []).map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <button type="button" onClick={() => removeAssignment(idx)} className="text-sm text-red-600">Remove</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addAssignment} className="mt-2 rounded-md bg-slate-100 px-3 py-1 text-sm">Add assignment</button>
            </div>
          )}

          {/* Class moderator */}
          {form.role === "Teacher" && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Class Moderator</h3>
              <label className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                <input type="checkbox" checked={isClassModerator} onChange={(e) => setIsClassModerator(e.target.checked)} />
                Assign as class moderator
              </label>
              {isClassModerator && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Level</label>
                    <select value={classModerator.level} onChange={handleClassModeratorChange("level")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                      <option value="">Select level</option>
                      <option value="Primary">Primary</option>
                      <option value="JSS">JSS</option>
                      <option value="SSS">SSS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Grade</label>
                    <select value={classModerator.grade} onChange={handleClassModeratorChange("grade")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                      <option value="">Select grade</option>
                      {(GRADE_OPTIONS[classModerator.level] || []).map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-md bg-[#0A2472] px-4 py-2 text-sm font-medium text-white hover:bg-[#0A2472]/90 disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
