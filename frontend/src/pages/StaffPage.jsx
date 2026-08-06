import { useEffect, useMemo, useState } from "react";
import FilterBar from "../components/FilterBar";
import StaffSearch from "../components/StaffSearch";
import StaffCard from "../components/StaffCard";
import { STAFF_FILTERS } from "../utils/filters";
import { getFullName } from "../utils/staffHelpers";

// TODO: replace with `axios.get("/api/staff/")` once the endpoint is ready.
import axios from "axios";



export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}staff/`
        );
        console.log("Fetched staff:", response.data);

        setStaff(response.data);
      } catch (error) {
        console.error("Failed to fetch staff:", error);
        throw error;
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Placeholders — wire these to your modal/API flows.
  const handleView = (member) => console.log("View staff", member);
  const handleEdit = (member) => console.log("Edit staff", member);
  const handleDelete = (member) => console.log("Delete staff", member);

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
        (member.phone_number ?? "").toLowerCase().includes(query)
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
            <button className="bg-[#0A2472] text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap">
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
    </div>
  );
}
