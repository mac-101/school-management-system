import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import TimetableGrid from "../components/TimetableGrid";
import TimetableFormModal from "../components/TimetableFormModal";
import PeriodsModal from "../components/PeriodsModal";

import {
  DAYS,
  LEVELS,
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
  const [selectedDay, setSelectedDay] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [prefill, setPrefill] = useState(null);
  const [periodsModalOpen, setPeriodsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  // --------------------------------------------------
  // FETCH EVERYTHING
  // --------------------------------------------------

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        timetableRes,
        classroomsRes,
        periodsRes,
        subjectsRes,
        staffRes,
      ] = await Promise.all([
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
      setTeachers(
        staffRes.data.filter(isActiveTeacher)
      );
    } catch (err) {
      console.error(err);

      setError(
        "Could not load the timetable. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // --------------------------------------------------
  // AUTO-DISMISS TOAST
  // --------------------------------------------------

  useEffect(() => {
    if (!toast) return;

    const id = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(id);
  }, [toast]);

  // --------------------------------------------------
  // CLASSROOMS FOR CURRENT LEVEL
  // --------------------------------------------------

  const visibleClassrooms = useMemo(() => {
    const filtered =
      selectedLevel === "All"
        ? classrooms
        : classrooms.filter(
          (classroom) =>
            classroom.level === selectedLevel
        );

    return [...filtered].sort(
      (a, b) =>
        classroomSortValue(a) -
        classroomSortValue(b)
    );
  }, [classrooms, selectedLevel]);

  // --------------------------------------------------
  // TIMETABLE ENTRIES FOR VISIBLE CLASSROOMS
  // --------------------------------------------------

  const visibleEntries = useMemo(() => {
    const classroomIds = new Set(
      visibleClassrooms.map(
        (classroom) => String(classroom.id)
      )
    );

    return timetable.filter((entry) =>
      classroomIds.has(String(entry.classroom))
    );
  }, [timetable, visibleClassrooms]);

  // --------------------------------------------------
  // ADD TIMETABLE ENTRY
  // --------------------------------------------------

  const openAddModal = () => {
    setEditingEntry(null);
    setPrefill(null);
    setModalOpen(true);
  };

  // --------------------------------------------------
  // CLICK EMPTY CELL
  // --------------------------------------------------

  const openCellModal = (
    classroom,
    day,
    periodId
  ) => {
    setEditingEntry(null);

    setPrefill({
      classroom: Number(classroom.id),
      day,
      period: Number(periodId),
    });

    setModalOpen(true);
  };

  // --------------------------------------------------
  // EDIT EXISTING ENTRY
  // --------------------------------------------------

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setPrefill(null);
    setModalOpen(true);
  };

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------

  const closeModal = () => {
    setModalOpen(false);
    setEditingEntry(null);
    setPrefill(null);
  };

  // --------------------------------------------------
  // AFTER SAVE
  // --------------------------------------------------

  const handleSaved = (isEditMode) => {
    closeModal();

    setToast(
      isEditMode
        ? "Timetable entry updated."
        : "Timetable entry added."
    );

    fetchAll();
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const handleDelete = async (entry) => {
    const label = `${entry.subject_name} on ${entry.day}`;

    if (
      !window.confirm(
        `Remove ${label}? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(entry.id);

    try {
      await axios.delete(
        `${API}timetable/${entry.id}/`
      );

      setTimetable((prev) =>
        prev.filter(
          (item) => item.id !== entry.id
        )
      );

      setToast("Timetable entry removed.");
    } catch (err) {
      console.error(err);

      setToast(
        "Could not remove this entry. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div>
      {/* -------------------------------------------- */}
      {/* PAGE HEADER */}
      {/* -------------------------------------------- */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 mb-1">
            Timetable
          </h1>

          <p className="text-sm text-slate-500">
            View and manage class timetables across
            the school.
          </p>
        </div>
        <div className="flex items-center gap-2">
        <button
          onClick={openAddModal}
          className="bg-[#0A2472] text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap"
        >
          + Add Timetable
        </button>
        <button
          onClick={() => setPeriodsModalOpen(true)}
          className="ml-3 bg-white border border-slate-200 text-sm font-medium px-3 py-2 rounded-lg"
        >
          Manage Periods
        </button>
        </div>
      </div>

      {/* -------------------------------------------- */}
      {/* LEVEL FILTER */}
      {/* -------------------------------------------- */}

      <div className="mb-6 flex gap-6 flex-col sm:flex-row ">
        <div>

          <p className="text-xs font-medium text-slate-500 mb-1.5">
            Level
          </p>

          <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {["All", ...LEVELS].map((level) => (
              <button
                key={level}
                onClick={() =>
                  setSelectedLevel(level)
                }
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${selectedLevel === level
                  ? "bg-white text-[#0A2472] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">
            Day
          </label>

          <div>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="text-sm rounded-md px-3 py-2 bg-slate-100 border border-slate-200"
            >
              <option value="All">All</option>
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* -------------------------------------------- */}
      {/* DAY FILTER (dropdown) */}
      {/* -------------------------------------------- */}


      {/* -------------------------------------------- */}
      {/* LOADING */}
      {/* -------------------------------------------- */}

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Loading timetable...
        </div>
      )}

      {/* -------------------------------------------- */}
      {/* ERROR */}
      {/* -------------------------------------------- */}

      {!loading && error && (
        <div className="flex items-center justify-center py-20 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* -------------------------------------------- */}
      {/* NO CLASSROOMS */}
      {/* -------------------------------------------- */}

      {!loading &&
        !error &&
        classrooms.length === 0 && (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
            No classes found.
          </div>
        )}

      {/* -------------------------------------------- */}
      {/* NO CLASSROOMS FOR SELECTED LEVEL */}
      {/* -------------------------------------------- */}

      {!loading &&
        !error &&
        classrooms.length > 0 &&
        visibleClassrooms.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-lg py-16 text-center text-sm text-slate-400">
            No classes found for this level.
          </div>
        )}

      {/* -------------------------------------------- */}
      {/* SCHOOL-WIDE TIMETABLE */}
      {/* -------------------------------------------- */}

      {!loading &&
        !error &&
        visibleClassrooms.length > 0 && (
          <TimetableGrid
            classrooms={visibleClassrooms}
            periods={periods}
            entries={visibleEntries}
            deletingId={deletingId}
            onCellClick={openCellModal}
            onEdit={openEditModal}
            onDelete={handleDelete}
            selectedDay={selectedDay}
          />
        )}

      {/* -------------------------------------------- */}
      {/* ADD / EDIT MODAL */}
      {/* -------------------------------------------- */}

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

      <PeriodsModal
        open={periodsModalOpen}
        onClose={() => setPeriodsModalOpen(false)}
        periods={periods}
        onSaved={() => {
          setPeriodsModalOpen(false);
          fetchAll();
        }}
      />

      {/* -------------------------------------------- */}
      {/* TOAST */}
      {/* -------------------------------------------- */}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}