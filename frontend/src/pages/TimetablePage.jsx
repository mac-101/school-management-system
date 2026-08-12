import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import TimetableGrid from "../components/TimetableGrid";
import TimetableFormModal from "../components/TimetableFormModal";
import {
  LEVELS,
  classroomLabel,
  classroomSortValue,
  isActiveTeacher,
} from "../utils/timetableHelpers";

const API = import.meta.env.VITE_API_URL;

export default function TimetablePage() {
  const [timetable, setTimetable] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedClass, setSelectedClass] = useState(""); // classroom id, string

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [prefill, setPrefill] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [timetableRes, classroomsRes, periodsRes, subjectsRes, staffRes] = await Promise.all([
        axios.get(`${API}timetable/`),
        axios.get(`${API}timetable/classes/`),
        axios.get(`${API}timetable/periods/`),
        axios.get(`${API}subjects/`),
        axios.get(`${API}staff/`),
      ]);
      setTimetable(timetableRes.data);
      setClassrooms(classroomsRes.data);
      setPeriods(periodsRes.data);
      setSubjects(subjectsRes.data);
      setTeachers(staffRes.data.filter(isActiveTeacher));
    } catch (err) {
      setError("Could not load the timetable. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-dismiss the success toast.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  // Classrooms available under the selected level, in curriculum order.
  const visibleClassrooms = useMemo(() => {
    const filtered =
      selectedLevel === "All"
        ? classrooms
        : classrooms.filter((c) => c.level === selectedLevel);
    return [...filtered].sort((a, b) => classroomSortValue(a) - classroomSortValue(b));
  }, [classrooms, selectedLevel]);

  // Keep the class dropdown pointed at a valid classroom whenever the level
  // filter changes or classrooms first load.
  useEffect(() => {
    const stillValid = visibleClassrooms.some((c) => String(c.id) === selectedClass);
    if (!stillValid) {
      setSelectedClass(visibleClassrooms[0] ? String(visibleClassrooms[0].id) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleClassrooms]);

  const entriesForClass = useMemo(() => {
    if (!selectedClass) return [];
    return timetable.filter((e) => String(e.classroom) === selectedClass);
  }, [timetable, selectedClass]);

  const openAddModal = () => {
    setEditingEntry(null);
    setPrefill(selectedClass ? { classroom: Number(selectedClass) } : null);
    setModalOpen(true);
  };

  const openCellModal = (day, periodId) => {
    setEditingEntry(null);
    setPrefill({ classroom: Number(selectedClass), day, period: periodId });
    setModalOpen(true);
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setPrefill(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEntry(null);
    setPrefill(null);
  };

  const handleSaved = (isEditMode) => {
    closeModal();
    setToast(isEditMode ? "Timetable entry updated." : "Timetable entry added.");
    fetchAll();
  };

  const handleDelete = async (entry) => {
    const label = `${entry.subject_name} on ${entry.day}`;
    if (!window.confirm(`Remove ${label}? This cannot be undone.`)) return;

    setDeletingId(entry.id);
    try {
      await axios.delete(`${API}timetable/${entry.id}/`);
      setTimetable((prev) => prev.filter((e) => e.id !== entry.id));
      setToast("Timetable entry removed.");
    } catch (err) {
      setToast("Could not remove this entry. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const selectedClassroom = classrooms.find((c) => String(c.id) === selectedClass);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 mb-1">Timetable</h1>
          <p className="text-sm text-slate-500">
            View and manage class timetables across the school.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#0A2472] text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap"
        >
          + Add Timetable
        </button>
      </div>

      {/* Level + class filters */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">Level</p>
          <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {["All", ...LEVELS].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  selectedLevel === level
                    ? "bg-white text-[#0A2472] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">Class</p>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={visibleClassrooms.length === 0}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30 disabled:bg-slate-50 disabled:text-slate-400 min-w-[160px]"
          >
            {visibleClassrooms.length === 0 && <option value="">No classes</option>}
            {visibleClassrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {classroomLabel(c)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Loading timetable...
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-center py-20 text-red-500 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && classrooms.length === 0 && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          No classes found.
        </div>
      )}

      {!loading && !error && classrooms.length > 0 && !selectedClassroom && (
        <div className="bg-white border border-slate-200 rounded-lg py-16 text-center text-sm text-slate-400">
          No classes found for this level.
        </div>
      )}

      {!loading && !error && selectedClassroom && (
        <TimetableGrid
          periods={periods}
          entries={entriesForClass}
          deletingId={deletingId}
          onCellClick={openCellModal}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      <TimetableFormModal
        open={modalOpen}
        entry={editingEntry}
        prefill={prefill}
        classrooms={classrooms}
        periods={periods}
        subjects={subjects}
        teachers={teachers}
        onClose={closeModal}
        onSaved={handleSaved}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
