import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import StudentFormModal from "../components/StudentFormModal";
import StudentFilterBar from "../components/StudentFilterBar";
import StudentTable from "../components/StudentTable";
import { FILTERS, filterStudents } from "../utils/filters";

export default function StudentListPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}students/`);
      console.log(res.data);
      setStudents(res.data);
    } catch (err) {
      setError("Could not load students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

   useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);
 
  const handleAddStudent = () => {
    setEditingStudent(null);
    setModalOpen(true);
  };
 
  const handleEdit = (student) => {
    setEditingStudent(student);
    setModalOpen(true);
  };
 
  const handleModalClose = () => {
    setModalOpen(false);
    setEditingStudent(null);
  };
 
  const handleSaved = (message) => {
    setModalOpen(false);
    setEditingStudent(null);
    setToast(message);
    fetchStudents();
  };

  const handleDelete = async (student) => {
    try {
      setError(null);
      await axios.delete(`${import.meta.env.VITE_API_URL}students/${student.id}/`);
      setStudents((prevStudents) => prevStudents.filter((item) => item.id !== student.id));
      alert(`Student ${student.first_name} ${student.last_name} deleted successfully.`);
    } catch (err) {
      setError("Could not delete student. Please try again.");
    }
  };

  // Count of students matching each filter, computed once per students change.
  const counts = useMemo(() => {
    const result = {};
    for (const filter of FILTERS) {
      result[filter.key] = students.filter(filter.test).length;
    }
    return result;
  }, [students]);

  // Students matching the currently active filter and the search text.
  const visibleStudents = useMemo(() => {
    return filterStudents(students, activeFilter, searchTerm);
  }, [students, activeFilter, searchTerm]);

  return (
    <>
      <div className="sticky top-0 z-20 bg-slate-50/95 py-4 backdrop-blur">

        <div className=" flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 mb-1">Students</h1>
            <p className="text-sm text-slate-500 mb-4">
              {students.length} student{students.length === 1 ? "" : "s"} across all classes
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

            <div className="relative w-full sm:w-72">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6 0 7.5 7.5 0 0010.6 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search staff by name, email or phone..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              />
            </div>
            <button onClick={handleAddStudent} className="bg-[#0A2472] text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap">
              + Add Student
            </button>

          </div>
        </div>
        {!loading && !error && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <StudentFilterBar
              counts={counts}
              activeFilter={activeFilter}
              onChange={setActiveFilter}
            />
          </div>
        )}
      </div>

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
          <StudentTable
            students={visibleStudents}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      {modalOpen && (
        <StudentFormModal
          key={editingStudent?.id ?? "new"}
          open={modalOpen}
          student={editingStudent}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 bg-[#0A2472] text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}