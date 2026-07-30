import { useEffect, useState } from "react";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import LevelGroup from "./components/LevelGroup";
import { groupStudentsByClass } from "./utils/groupStudents";

export default function StudentListPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStudents() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/students/");
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

  const levelGroups = groupStudentsByClass(students);

  return (
    <AppLayout activePage="students">
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
        <div>
          {levelGroups.map((group) => (
            <LevelGroup
              key={group.level}
              level={group.level}
              classes={group.classes}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
