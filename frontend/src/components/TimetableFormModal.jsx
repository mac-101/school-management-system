import { useEffect, useState } from "react";
import axios from "axios";
import {
  DAYS,
  classroomLabel,
  classroomSortValue,
  sortPeriods,
  periodOptionLabel,
  getStaffFullName,
  extractErrorMessage,
} from "../utils/timetableHelpers";

const EMPTY_FORM = {
  classroom: "",
  day: "",
  period: "",
  subject: "",
  teacher: "",
  room: "",
};

function toFormState(entry, prefill) {
  if (entry) {
    return {
      classroom: String(entry.classroom ?? ""),
      day: entry.day ?? "",
      period: String(entry.period ?? ""),
      subject: String(entry.subject ?? ""),
      teacher: String(entry.teacher ?? ""),
      room: entry.room ?? "",
    };
  }
  return {
    ...EMPTY_FORM,
    classroom: prefill?.classroom ? String(prefill.classroom) : "",
    day: prefill?.day ?? "",
    period: prefill?.period ? String(prefill.period) : "",
  };
}

/**
 * Add/Edit Timetable Entry modal. Pass `entry` to open in edit mode
 * (pre-filled, PUT on submit). Pass `prefill` (classroom/day/period) to
 * pre-fill a new entry opened from an empty grid cell.
 */
export default function TimetableFormModal({
  open,
  entry,
  prefill,
  classrooms,
  periods,
  subjects,
  teachers,
  onClose,
  onSaved,
}) {
  const isEditMode = Boolean(entry);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setForm(toFormState(entry, prefill));
    setErrors({});
    setSubmitError(null);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open, entry, prefill]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const orderedClassrooms = [...classrooms].sort(
    (a, b) => classroomSortValue(a) - classroomSortValue(b)
  );
  const orderedPeriods = sortPeriods(periods);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.classroom) newErrors.classroom = "Class is required.";
    if (!form.day) newErrors.day = "Day is required.";
    if (!form.period) newErrors.period = "Period is required.";
    if (!form.subject) newErrors.subject = "Subject is required.";
    if (!form.teacher) newErrors.teacher = "Teacher is required.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      classroom: Number(form.classroom),
      subject: Number(form.subject),
      teacher: Number(form.teacher),
      day: form.day,
      period: Number(form.period),
      room: form.room.trim(),
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isEditMode) {
        await axios.put(`${import.meta.env.VITE_API_URL}timetable/${entry.id}/`, payload);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}timetable/`, payload);
      }
      onSaved(isEditMode);
    } catch (err) {
      setSubmitError(
        extractErrorMessage(
          err,
          `Could not ${isEditMode ? "update" : "create"} this timetable entry. Please try again.`
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[560px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl transition-all duration-200 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEditMode ? "Edit Timetable Entry" : "Add Timetable Entry"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          {submitError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Class</label>
              <select
                value={form.classroom}
                onChange={handleChange("classroom")}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              >
                <option value="">Select class</option>
                {orderedClassrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {classroomLabel(c)}
                  </option>
                ))}
              </select>
              {errors.classroom && <p className="text-xs text-red-600 mt-1">{errors.classroom}</p>}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Day</label>
              <select
                value={form.day}
                onChange={handleChange("day")}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              >
                <option value="">Select day</option>
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              {errors.day && <p className="text-xs text-red-600 mt-1">{errors.day}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Period</label>
              <select
                value={form.period}
                onChange={handleChange("period")}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              >
                <option value="">Select period</option>
                {orderedPeriods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {periodOptionLabel(p)}
                  </option>
                ))}
              </select>
              {errors.period && <p className="text-xs text-red-600 mt-1">{errors.period}</p>}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Subject</label>
              <select
                value={form.subject}
                onChange={handleChange("subject")}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Teacher</label>
              <select
                value={form.teacher}
                onChange={handleChange("teacher")}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              >
                <option value="">Select teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {getStaffFullName(t)}
                  </option>
                ))}
              </select>
              {errors.teacher && <p className="text-xs text-red-600 mt-1">{errors.teacher}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Room (optional)</label>
              <input
                type="text"
                value={form.room}
                onChange={handleChange("room")}
                placeholder="e.g. Room 3"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
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
              {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
