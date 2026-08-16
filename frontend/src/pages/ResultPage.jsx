import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ResultAnalytics from "../components/ResultAnalytics";
import ResultFormModal from "../components/ResultFormModal";

const LEVELS = ["Primary", "JSS", "SSS"];

const TERMS = [
  "First Term",
  "Second Term",
  "Third Term",
];

function classLabel(result) {
  return `${result.level} ${result.grade}`;
}

function getStudentFullName(result) {
  return result.student_name || "";
}

export default function ResultsPage() {
  const navigate = useNavigate();

  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [students, setStudents] = useState([]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeView, setActiveView] = useState("overview"); // "overview" or "list"

  const [session, setSession] = useState("All");
  const [term, setTerm] = useState("All");
  const [level, setLevel] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}results/`
      );

      const studentsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}students/`
      );

      setStudents(
        Array.isArray(studentsRes.data)
          ? studentsRes.data
          : studentsRes.data?.results ?? []
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.results ?? [];

      setResults(data);
    } catch (err) {
      console.error(err);
      setError("Could not load results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // ----------------------------------------
  // FILTER OPTIONS
  // ----------------------------------------

  const sessionOptions = useMemo(() => {
    const values = new Set(
      results
        .map((result) => result.academic_session)
        .filter(Boolean)
    );

    return Array.from(values).sort().reverse();
  }, [results]);

  const classOptions = useMemo(() => {
    const scoped = results.filter(
      (result) =>
        (session === "All" ||
          result.academic_session === session) &&
        (term === "All" || result.term === term) &&
        (level === "All" || result.level === level)
    );

    const values = new Set(
      scoped.map((result) => classLabel(result))
    );

    return Array.from(values).sort();
  }, [results, session, term, level]);

  useEffect(() => {
    if (
      classFilter !== "All" &&
      !classOptions.includes(classFilter)
    ) {
      setClassFilter("All");
    }
  }, [classOptions, classFilter]);

  // ----------------------------------------
  // FILTERED RESULTS
  // ----------------------------------------

  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    return results.filter((result) => {
      if (
        session !== "All" &&
        result.academic_session !== session
      ) {
        return false;
      }

      if (
        term !== "All" &&
        result.term !== term
      ) {
        return false;
      }

      if (
        level !== "All" &&
        result.level !== level
      ) {
        return false;
      }

      if (
        classFilter !== "All" &&
        classLabel(result) !== classFilter
      ) {
        return false;
      }

      if (query) {
        const matchesName = getStudentFullName(result)
          .toLowerCase()
          .includes(query);

        const matchesId = (result.student_id || "")
          .toLowerCase()
          .includes(query);

        if (!matchesName && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [
    results,
    session,
    term,
    level,
    classFilter,
    search,
  ]);

  const filtersActive =
    session !== "All" ||
    term !== "All" ||
    level !== "All" ||
    classFilter !== "All" ||
    search.trim() !== "";

  const goToResult = (resultId) => {
    navigate(`/results/${resultId}`);
  };

  // ----------------------------------------
  // RENDER
  // ----------------------------------------

  return (
    <div activePage="results">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">
          Results
        </h1>

        <p className="text-sm text-slate-500">
          View and manage student academic results
        </p>
      </div>

      {/* ---------------------------------------- */}
      {/* HORIZONTAL VIEW SWITCHER */}
      {/* ---------------------------------------- */}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveView("overview")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeView === "overview"
              ? "bg-white text-[#0A2472] shadow-sm"
              : "text-slate-500 hover:text-slate-700"
              }`}
          >
            Results Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveView("list")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeView === "list"
              ? "bg-white text-[#0A2472] shadow-sm"
              : "text-slate-500 hover:text-slate-700"
              }`}
          >
            Results List
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingResult(null);
            setResultModalOpen(true);
          }}
          className="bg-[#0A2472] text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Add Result
        </button>
      </div>

      {/* ---------------------------------------- */}
      {/* OVERVIEW VIEW */}
      {/* ---------------------------------------- */}

      {activeView === "overview" && (
        <section>
          <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-[360px] flex flex-col ">
            <ResultAnalytics results={results} />
          </div>
        </section>
      )}

      {/* ---------------------------------------- */}
      {/* RESULTS LIST VIEW */}
      {/* ---------------------------------------- */}

      {activeView === "list" && (
        <section>
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">
                Academic Session
              </p>

              <select
                value={session}
                onChange={(event) =>
                  setSession(event.target.value)
                }
                className="border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30 min-w-[140px]"
              >
                <option value="All">
                  All Sessions
                </option>

                {sessionOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">
                Term
              </p>

              <select
                value={term}
                onChange={(event) =>
                  setTerm(event.target.value)
                }
                className="border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30 min-w-[130px]"
              >
                <option value="All">
                  All Terms
                </option>

                {TERMS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">
                Level
              </p>

              <select
                value={level}
                onChange={(event) =>
                  setLevel(event.target.value)
                }
                className="border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30 min-w-[110px]"
              >
                <option value="All">
                  All Levels
                </option>

                {LEVELS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">
                Class
              </p>

              <select
                value={classFilter}
                onChange={(event) =>
                  setClassFilter(event.target.value)
                }
                disabled={classOptions.length === 0}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30 min-w-[120px] disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="All">
                  All Classes
                </option>

                {classOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 min-w-[220px]">
              <p className="text-xs font-medium text-slate-500 mb-1">
                Search Student
              </p>

              <svg
                className="absolute left-3 top-[38px] w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6 0 7.5 7.5 0 0010.6 0z"
                />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Name or student ID..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
              />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              Loading results...
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-center justify-center py-20 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* No results at all */}
          {!loading &&
            !error &&
            results.length === 0 && (
              <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
                No results found.
              </div>
            )}

          {/* Filtered empty */}
          {!loading &&
            !error &&
            results.length > 0 &&
            filteredResults.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-lg py-16 text-center text-sm text-slate-400">
                {filtersActive
                  ? "No results match the selected filters."
                  : "No results found."}
              </div>
            )}

          {/* Results table */}
          {!loading &&
            !error &&
            filteredResults.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-200">
                      <th className="py-3 px-4 font-medium whitespace-nowrap">
                        Student
                      </th>

                      <th className="py-3 px-4 font-medium whitespace-nowrap">
                        Student ID
                      </th>

                      <th className="py-3 px-4 font-medium whitespace-nowrap">
                        Class
                      </th>

                      <th className="py-3 px-4 font-medium whitespace-nowrap">
                        Term
                      </th>

                      <th className="py-3 px-4 font-medium whitespace-nowrap">
                        Academic Session
                      </th>

                      <th className="py-3 px-4 font-medium whitespace-nowrap">
                        Total Score
                      </th>

                      <th className="py-3 px-4 font-medium whitespace-nowrap">
                        Average
                      </th>

                      <th className="py-3 px-4 font-medium whitespace-nowrap text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredResults.map((result) => (
                      <tr
                        key={result.id}
                        onClick={() =>
                          goToResult(result.id)
                        }
                        className="border-b border-slate-100 text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          {result.student_name}
                        </td>

                        <td className="py-2.5 px-4 whitespace-nowrap">
                          {result.student_id}
                        </td>

                        <td className="py-2.5 px-4 whitespace-nowrap">
                          {classLabel(result)}
                        </td>

                        <td className="py-2.5 px-4 whitespace-nowrap">
                          {result.term}
                        </td>

                        <td className="py-2.5 px-4 whitespace-nowrap">
                          {result.academic_session}
                        </td>

                        <td className="py-2.5 px-4 whitespace-nowrap">
                          {result.total_score}
                        </td>

                        <td className="py-2.5 px-4 whitespace-nowrap">
                          {result.average_score != null
                            ? `${result.average_score}%`
                            : "—"}
                        </td>

                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              goToResult(result.id);
                            }}
                            className="text-[#0A2472] hover:underline mr-3 text-xs font-medium"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              console.log(
                                "Edit result",
                                result
                              );
                            }}
                            className="text-slate-600 hover:underline text-xs font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      )}
      <ResultFormModal
        open={resultModalOpen}
        result={editingResult}
        students={students}
        onClose={() => {
          setResultModalOpen(false);
          setEditingResult(null);
        }}
        onSaved={() => {
          setResultModalOpen(false);
          setEditingResult(null);
          fetchResults();
        }}
      />
    </div>
  );
}