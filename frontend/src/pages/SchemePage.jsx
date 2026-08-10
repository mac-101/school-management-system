import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SchemeFormModal from "../components/SchemeFormModal";

const TERMS = ["First Term", "Second Term", "Third Term"];
const LEVEL_ORDER = { Primary: 0, JSS: 1, SSS: 2 };

// Sorts by level (Primary, JSS, SSS) then grade ascending.
function classSortValue({ level, grade }) {
  return (LEVEL_ORDER[level] ?? 99) * 100 + Number(grade || 0);
}

function ChevronRight() {
  return (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function BackArrow() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

export default function SchemePage() {
  const navigate = useNavigate();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTerm, setActiveTerm] = useState("First Term");
  const [selectedClass, setSelectedClass] = useState(null); // e.g. "JSS 1", or null = class list

  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}schemes/`);
      console.log(res.data); // TEMP: inspect the actual shape Django returns
      setSchemes(res.data);
    } catch (err) {
      setError("Could not load schemes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  // A class picked under one term may not exist under another — drop back
  // to the class list whenever the term changes.
  useEffect(() => {
    setSelectedClass(null);
  }, [activeTerm]);

  // Auto-dismiss the success toast.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const handleSaved = () => {
    setModalOpen(false);
    setToast("Scheme created successfully.");
    fetchSchemes();
  };

  // Filter by term first, then group by "Level Grade" (e.g. "JSS 1").
  const termSchemes = useMemo(
    () => schemes.filter((s) => s.term === activeTerm),
    [schemes, activeTerm]
  );

  const curriculumGroups = useMemo(() => {
    const map = new Map();
    for (const scheme of termSchemes) {
      const label = `${scheme.level} ${scheme.grade}`;
      if (!map.has(label)) {
        map.set(label, { label, level: scheme.level, grade: scheme.grade, schemes: [] });
      }
      map.get(label).schemes.push(scheme);
    }
    return Array.from(map.values())
      .map((group) => ({
        ...group,
        schemes: [...group.schemes].sort((a, b) =>
          (a.subject_name || "").localeCompare(b.subject_name || "")
        ),
      }))
      .sort((a, b) => classSortValue(a) - classSortValue(b));
  }, [termSchemes]);

  const activeGroup = curriculumGroups.find((g) => g.label === selectedClass) || null;

  const goToScheme = (schemeId) => navigate(`/schemes/${schemeId}`);

  return (
    <div activePage="schemes">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 mb-1">Schemes</h1>
          <p className="text-sm text-slate-500">Manage curriculum and schemes of work</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-[#0A2472] text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap"
        >
          + Add Scheme
        </button>
      </div>

      {/* Term filter */}
      <div className="flex gap-6 overflow-x-auto border-b border-slate-200 mb-6">
        {TERMS.map((term) => {
          const isActive = term === activeTerm;
          return (
            <button
              key={term}
              onClick={() => setActiveTerm(term)}
              className={`px-1 py-3 text-sm border-b-2 -mb-px whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? "border-[#0A2472] text-[#0A2472] font-medium"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {term}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Loading schemes...
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-center py-20 text-red-500 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && schemes.length === 0 && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          No schemes found.
        </div>
      )}

      {!loading && !error && schemes.length > 0 && termSchemes.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg py-16 text-center text-sm text-slate-400">
          No schemes found for this term.
        </div>
      )}

      {/* Class list — clicking a class drills into its subjects below */}
      {!loading && !error && termSchemes.length > 0 && !activeGroup && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {curriculumGroups.map((group) => (
            <button
              key={group.label}
              onClick={() => setSelectedClass(group.label)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
            >
              <span className="font-medium text-slate-800">{group.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {group.schemes.length} subject{group.schemes.length === 1 ? "" : "s"}
                </span>
                <ChevronRight />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Subjects for the selected class */}
      {!loading && !error && termSchemes.length > 0 && activeGroup && (
        <div>
          <button
            onClick={() => setSelectedClass(null)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0A2472] mb-3"
          >
            <BackArrow />
            Back to Classes
          </button>

          <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
            {activeGroup.label}
          </p>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            {activeGroup.schemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => goToScheme(scheme.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
              >
                <span className="text-sm text-slate-700">{scheme.subject_name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {(scheme.weeks || []).length} weeks
                  </span>
                  <ChevronRight />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <SchemeFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
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