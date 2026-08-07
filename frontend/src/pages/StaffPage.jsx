import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterBar from "../components/FilterBar";
import StaffSearch from "../components/StaffSearch";
import StaffCard from "../components/StaffCard";
import StaffFormModal from "../components/StaffFormModal";
import { STAFF_FILTERS } from "../utils/filters";
import { getFullName } from "../utils/staffHelpers";
import axios from "axios";

export default function Staff() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}staff/`);
      setStaff(response.data);
    } catch (error) {
      setError("Could not load staff. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleView = (member) => navigate(`/staff/${member.id}`);

  const handleAddStaff = () => {
    setEditingStaff(null);
    setModalOpen(true);
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingStaff(null);
  };

  const handleSaved = (message) => {
    setModalOpen(false);
    setEditingStaff(null);
    setToast(message);
    fetchStaff();
  };

  const handleDelete = async (member) => {
    try {
      setError(null);
      await axios.delete(`${import.meta.env.VITE_API_URL}staff/${member.id}/`);
      setStaff((prevStaff) => prevStaff.filter((item) => item.id !== member.id));
      setToast(`Staff member ${member.first_name} ${member.last_name} deleted successfully.`);
    } catch (error) {
      setError("Could not delete staff. Please try again.");
    }
  };

  const counts = useMemo(() => {
    const result = {};
    for (const filter of STAFF_FILTERS) {
      result[filter.key] = staff.filter(filter.test).length;
    }
    return result;
  }, [staff]);

  function getFullName(staff) {
    return `${staff.first_name} ${staff.last_name}`;
  }

  const visibleStaff = useMemo(() => {
    const filter =
      STAFF_FILTERS.find((f) => f.key === activeFilter) ?? STAFF_FILTERS[0];

    const query = search.trim().toLowerCase();

    return staff.filter((member) => {
      if (!filter.test(member)) return false;

      if (!query) return true;

      return (
        getFullName(member).toLowerCase().includes(query) ||
        (member.email ?? "").toLowerCase().includes(query) ||
        (member.phone_number ?? "").toLowerCase().includes(query) ||
        (member.role ?? "").toLowerCase().includes(query)
      );
    });
  }, [staff, activeFilter, search]);

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-20 mb-4 bg-slate-50/95 py-4 backdrop-blur ">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 mb-1">Staff</h1>
            <p className="text-sm text-slate-500">
              {staff.length} staff member{staff.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <StaffSearch value={search} onChange={setSearch} />
            <button
              onClick={handleAddStaff}
              className="bg-[#0A2472] text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap"
            >
              + Add Staff
            </button>
          </div>
        </div>
        {!loading && !error && (
          <FilterBar counts={counts} activeFilter={activeFilter} onChange={setActiveFilter} />

        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Loading staff...
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-center py-20 text-red-500 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && staff.length === 0 && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          No staff records found.
        </div>
      )}

      {!loading && !error && staff.length > 0 && (
        <>
          {visibleStaff.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg py-16 text-center text-sm text-slate-400">
              No staff match this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleStaff.map((member) => (
                <StaffCard
                  key={member.id}
                  staff={member}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <StaffFormModal
          open={modalOpen}
          member={editingStaff}
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
