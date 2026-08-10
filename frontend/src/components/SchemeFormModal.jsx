import { useEffect, useState } from "react";
import axios from "axios";

const LEVELS = ["Primary", "JSS", "SSS"];
const GRADE_OPTIONS = {
  Primary: [1, 2, 3, 4, 5],
  JSS: [1, 2, 3],
  SSS: [1, 2, 3],
};
const TERMS = ["First Term", "Second Term", "Third Term"];

let localId = 0;
const nextLocalId = () => `local-${++localId}`;

function emptyWeek(weekNumber) {
  return { localId: nextLocalId(), week_number: weekNumber, topic: "", subtopics: [] };
}

function emptySubtopic() {
  return { localId: nextLocalId(), title: "" };
}

const EMPTY_FORM = {
  subject: "",
  level: "",
  grade: "",
  term: "",
  academic_session: "",
  weeks: [emptyWeek(1)],
};

function toFormState(scheme) {
  if (!scheme) return EMPTY_FORM;
  return {
    subject: scheme.subject != null ? String(scheme.subject) : "",
    level: scheme.level || "",
    grade: scheme.grade != null ? String(scheme.grade) : "",
    term: scheme.term || "",
    academic_session: scheme.academic_session || "",
    weeks:
      scheme.weeks && scheme.weeks.length > 0
        ? scheme.weeks.map((w) => ({
            localId: `week-${w.id}`,
            week_number: w.week_number,
            topic: w.topic || "",
            subtopics: (w.subtopics || []).map((s) => ({
              localId: `subtopic-${s.id}`,
              title: s.title || "",
            })),
          }))
        : [emptyWeek(1)],
  };
}

export default function SchemeFormModal({ open, scheme, onClose, onSaved }) {
  const isEditMode = Boolean(scheme);

  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [visible, setVisible] = useState(false);

  // Fetch subjects fresh every time the modal opens, and reset the form.
  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }

    setForm(toFormState(scheme));
    setErrors({});
    setSubmitError(null);

    const id = requestAnimationFrame(() => setVisible(true));

    async function fetchSubjects() {
      setSubjectsLoading(true);
      setSubjectsError(null);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}subjects/`);
        setSubjects(res.data);
      } catch (err) {
        setSubjectsError("Could not load subjects.");
      } finally {
        setSubjectsLoading(false);
      }
    }
    fetchSubjects();

    return () => cancelAnimationFrame(id);
  }, [open, scheme]);

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

  const handleFieldChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      if (field === "level") return { ...prev, level: value, grade: "" };
      return { ...prev, [field]: value };
    });
  };

  const handleWeekChange = (weekLocalId, field, value) => {
    setForm((prev) => ({
      ...prev,
      weeks: prev.weeks.map((w) =>
        w.localId === weekLocalId ? { ...w, [field]: value } : w
      ),
    }));
  };

  const handleAddWeek = () => {
    setForm((prev) => ({
      ...prev,
      weeks: [...prev.weeks, emptyWeek(prev.weeks.length + 1)],
    }));
  };

  const handleRemoveWeek = (weekLocalId) => {
    setForm((prev) => {
      const remaining = prev.weeks.filter((w) => w.localId !== weekLocalId);
      // Renumber sequentially so week_number always stays 1..n.
      const renumbered = remaining.map((w, i) => ({ ...w, week_number: i + 1 }));
      return { ...prev, weeks: renumbered.length > 0 ? renumbered : [emptyWeek(1)] };
    });
  };

  const handleAddSubtopic = (weekLocalId) => {
    setForm((prev) => ({
      ...prev,
      weeks: prev.weeks.map((w) =>
        w.localId === weekLocalId
          ? { ...w, subtopics: [...w.subtopics, emptySubtopic()] }
          : w
      ),
    }));
  };

  const handleSubtopicChange = (weekLocalId, subtopicLocalId, value) => {
    setForm((prev) => ({
      ...prev,
      weeks: prev.weeks.map((w) =>
        w.localId === weekLocalId
          ? {
              ...w,
              subtopics: w.subtopics.map((s) =>
                s.localId === subtopicLocalId ? { ...s, title: value } : s
              ),
            }
          : w
      ),
    }));
  };

  const handleRemoveSubtopic = (weekLocalId, subtopicLocalId) => {
    setForm((prev) => ({
      ...prev,
      weeks: prev.weeks.map((w) =>
        w.localId === weekLocalId
          ? { ...w, subtopics: w.subtopics.filter((s) => s.localId !== subtopicLocalId) }
          : w
      ),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.subject) newErrors.subject = "Subject is required.";
    if (!form.level) newErrors.level = "Level is required.";
    if (!form.grade) newErrors.grade = "Grade is required.";
    if (!form.term) newErrors.term = "Term is required.";
    if (!form.academic_session.trim())
      newErrors.academic_session = "Academic session is required.";

    const weekErrors = {};
    form.weeks.forEach((w) => {
      if (!w.topic.trim()) weekErrors[w.localId] = "Topic is required.";
    });
    if (Object.keys(weekErrors).length > 0) newErrors.weeks = weekErrors;

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      subject: Number(form.subject),
      level: form.level,
      grade: Number(form.grade),
      term: form.term,
      academic_session: form.academic_session.trim(),
      weeks: form.weeks.map((w) => ({
        week_number: w.week_number,
        topic: w.topic.trim(),
        subtopics: w.subtopics
          .map((s) => ({ title: s.title.trim() }))
          .filter((s) => s.title.length > 0),
      })),
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isEditMode) {
        await axios.put(`${import.meta.env.VITE_API_URL}schemes/${scheme.id}/`, payload);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}schemes/`, payload);
        setForm(EMPTY_FORM);
      }
      setErrors({});
      onSaved(isEditMode);
    } catch (err) {
      setSubmitError(
        err.response?.data?.detail ||
          `Could not ${isEditMode ? "update" : "create"} scheme. Please check the form and try again.`
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
        className={`w-full max-w-[760px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl transition-all duration-200 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEditMode ? "Edit Scheme" : "Add Scheme"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          {submitError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {submitError}
            </div>
          )}

          {/* Scheme information */}
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Scheme Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Level</label>
              <select
                value={form.level}
                onChange={handleFieldChange("level")}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              >
                <option value="">Select level</option>
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              {errors.level && <p className="text-xs text-red-600 mt-1">{errors.level}</p>}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Grade</label>
              <select
                value={form.grade}
                onChange={handleFieldChange("grade")}
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
            <div>
              <label className="block text-sm text-slate-600 mb-1">Subject</label>
              <select
                value={form.subject}
                onChange={handleFieldChange("subject")}
                disabled={subjectsLoading}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30 disabled:bg-slate-50"
              >
                <option value="">
                  {subjectsLoading ? "Loading subjects..." : "Select subject"}
                </option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {subjectsError && <p className="text-xs text-red-600 mt-1">{subjectsError}</p>}
              {errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Academic Session</label>
              <input
                type="text"
                value={form.academic_session}
                onChange={handleFieldChange("academic_session")}
                placeholder="e.g. 2025/2026"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              />
              {errors.academic_session && (
                <p className="text-xs text-red-600 mt-1">{errors.academic_session}</p>
              )}
            </div>


            <div>
              <label className="block text-sm text-slate-600 mb-1">Term</label>
              <select
                value={form.term}
                onChange={handleFieldChange("term")}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              >
                <option value="">Select term</option>
                {TERMS.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
              {errors.term && <p className="text-xs text-red-600 mt-1">{errors.term}</p>}
            </div>
          </div>

          {/* Weeks */}
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Weeks</h3>
          <div className="space-y-4 mb-4">
            {form.weeks.map((week) => (
              <div key={week.localId} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#0A2472]">
                    Week {week.week_number}
                  </span>
                  {form.weeks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveWeek(week.localId)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove week
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <label className="block text-sm text-slate-600 mb-1">Topic</label>
                  <input
                    type="text"
                    value={week.topic}
                    onChange={(e) => handleWeekChange(week.localId, "topic", e.target.value)}
                    placeholder="e.g. Number System"
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
                  />
                  {errors.weeks?.[week.localId] && (
                    <p className="text-xs text-red-600 mt-1">{errors.weeks[week.localId]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Subtopics</label>
                  <div className="space-y-2">
                    {week.subtopics.map((subtopic) => (
                      <div key={subtopic.localId} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={subtopic.title}
                          onChange={(e) =>
                            handleSubtopicChange(week.localId, subtopic.localId, e.target.value)
                          }
                          placeholder="e.g. Natural Numbers"
                          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtopic(week.localId, subtopic.localId)}
                          className="text-xs text-red-600 hover:underline whitespace-nowrap"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSubtopic(week.localId)}
                    className="mt-2 text-xs font-medium text-[#0A2472] hover:underline"
                  >
                    + Add Subtopic
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddWeek}
            className="mb-6 text-sm font-medium text-[#0A2472] hover:underline"
          >
            + Add Week
          </button>

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
              {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Scheme"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}