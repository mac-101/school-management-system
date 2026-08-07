import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import StaffFormModal from "../components/StaffFormModal";
import { getFullName, getInitials } from "../utils/staffHelpers";

export default function StaffDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}staff/${id}/`);
      setStaff(response.data);
    } catch (err) {
      setError("Could not load staff details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleEdit = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleSaved = (message) => {
    setModalOpen(false);
    setToast(message);
    fetchStaff();
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-slate-400">Loading staff details...</div>
    );
  }

  if (error || !staff) {
    return (
      <div className="py-20 text-center text-sm text-red-500">{error || "Staff not found."}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-[#0A2472] hover:underline"
        >
          ← Back to staff
        </button>
        <button
          onClick={handleEdit}
          className="rounded-lg bg-[#0A2472] px-4 py-2 text-sm font-medium text-white"
        >
          Edit Staff
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 ">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0A2472]/10 text-lg font-semibold text-[#0A2472]">
              {getInitials(staff)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">{getFullName(staff)}</h1>
              <p className="mt-1 text-sm text-slate-500">{staff.role}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {staff.employment_type}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${staff.is_active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {staff.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Contact</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><span className="font-medium text-slate-500">Phone:</span> {staff.phone_number}</p>
              <p><span className="font-medium text-slate-500">Email:</span> {staff.email || "—"}</p>
              <p><span className="font-medium text-slate-500">Gender:</span> {staff.gender}</p>
              <p><span className="font-medium text-slate-500">Age:</span> {staff.age}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Employment</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><span className="font-medium text-slate-500">Salary:</span> ₦{Number(staff.salary || 0).toLocaleString()}</p>
              <p><span className="font-medium text-slate-500">Date employed:</span> {staff.date_employed ? new Date(staff.date_employed).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        </div>

        {staff.assignments?.length > 0 && (
          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Assignments</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {staff.assignments.map((assignment) => (
                <li key={assignment.id}>
                  • {assignment.subject?.name || "Subject"} — {assignment.level} {assignment.grade}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {modalOpen && (
        <StaffFormModal
          open={modalOpen}
          member={staff}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-[#0A2472] px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
