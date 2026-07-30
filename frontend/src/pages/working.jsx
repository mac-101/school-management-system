import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import StudentFilterBar from "../components/StudentFilterBar";
import StudentTable from "../components/StudentTable";
import { FILTERS } from "../utils/filters";

export default function StudentListPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    async function fetchStudents() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}students/`);

        console.log(res.data);
        setStudents(res.data);

        if (!cancelled) setStudents(res.data);
      } catch (err) {
        if (!cancelled) setError("Could not load students. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStudents();
    return () => {
      cancelled = true;
    };
  }, []);

  // Placeholders — wire these up to your edit/delete flows (modal, API calls, etc.)
  const handleEdit = (student) => {
    console.log("Edit student", student);
  };

  const handleDelete = (student) => {
    console.log("Delete student", student);
  };

  // Count of students matching each filter, computed once per students change.
  const counts = useMemo(() => {
    const result = {};
    for (const filter of FILTERS) {
      result[filter.key] = students.filter(filter.test).length;
    }
    return result;
  }, [students]);

  // Students matching the currently active filter — no re-fetching, just
  // filtering the data already in state.
  const visibleStudents = useMemo(() => {
    const filter = FILTERS.find((f) => f.key === activeFilter) ?? FILTERS[0];
    return students.filter(filter.test);
  }, [students, activeFilter]);

  return (
    <>
      <h1 className="text-xl font-semibold text-slate-800 mb-1">Students</h1>
      <p className="text-sm text-slate-500 mb-6">
        {students.length} student{students.length === 1 ? "" : "s"} across all classes
      </p>

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Loading students...
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-center py-20 text-red-500 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && students.length === 0 && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          No students found.
        </div>
      )}

      {!loading && !error && students.length > 0 && (
        <>
          <StudentFilterBar
            filters={FILTERS}
            counts={counts}
            activeFilter={activeFilter}
            onChange={setActiveFilter}
          />
          <StudentTable
            students={visibleStudents}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}
    </>
  );
}
