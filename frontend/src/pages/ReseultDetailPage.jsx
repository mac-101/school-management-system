import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function formatScore(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return Number(value).toFixed(2).replace(/\.00$/, "");
}

function getGrade(score) {
  const value = Number(score);

  if (value >= 80) return "A";
  if (value >= 70) return "B";
  if (value >= 60) return "C";
  if (value >= 50) return "D";
  if (value >= 45) return "E";
  return "F";
}

function getGradeLabel(grade) {
  const labels = {
    A: "Excellent",
    B: "Very Good",
    C: "Good",
    D: "Fair",
    E: "Pass",
    F: "Fail",
  };

  return labels[grade] || "";
}

export default function ResultDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [dateCreated, setDateCreated] = useState(null);

  /*
   * Local editable copy.
   *
   * We don't directly mutate result while editing.
   * This means Cancel can safely discard all changes.
   */
  const [editedScores, setEditedScores] = useState({});
  const [teacherRemark, setTeacherRemark] = useState("");
  const [principalRemark, setPrincipalRemark] = useState("");

  /*
   * --------------------------------------------------
   * FETCH RESULT
   * --------------------------------------------------
   */

  const fetchResult = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}results/${id}/`
      );

      setResult(response.data);
      setDateCreated(response.data.date_created.split('T')[0]);
    } catch (err) {
      console.error(err);

      if (err?.response?.status === 404) {
        setError("Result not found.");
      } else {
        setError("Could not load this result.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  /*
   * --------------------------------------------------
   * SORT SUBJECTS
   * --------------------------------------------------
   */

  const subjectScores = useMemo(() => {
    return [...(result?.subject_scores || [])].sort((a, b) =>
      (a.subject_name || "").localeCompare(b.subject_name || "")
    );
  }, [result]);

  /*
   * --------------------------------------------------
   * EDIT MODE INITIALIZATION
   * --------------------------------------------------
   */

  const startEditing = () => {
    const initialScores = {};

    subjectScores.forEach((item) => {
      initialScores[item.id || item.subject] = item.score ?? "";
    });

    setEditedScores(initialScores);
    setTeacherRemark(result?.teacher_remark || "");
    setPrincipalRemark(result?.principal_remark || "");
    setSaveError(null);
    setEditing(true);
  };

  /*
   * --------------------------------------------------
   * CANCEL EDITING
   * --------------------------------------------------
   */

  const cancelEditing = () => {
    setEditedScores({});
    setTeacherRemark("");
    setPrincipalRemark("");
    setSaveError(null);
    setEditing(false);
  };

  /*
   * --------------------------------------------------
   * SCORE CHANGE
   * --------------------------------------------------
   */

  const handleScoreChange = (subjectKey, value) => {
    if (value === "") {
      setEditedScores((prev) => ({
        ...prev,
        [subjectKey]: "",
      }));

      return;
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return;
    }

    if (numericValue < 0 || numericValue > 100) {
      return;
    }

    setEditedScores((prev) => ({
      ...prev,
      [subjectKey]: value,
    }));
  };

  /*
   * --------------------------------------------------
   * EDITED SCORE HELPERS
   * --------------------------------------------------
   */

  const getEditedScore = (item) => {
    const key = item.id || item.subject;

    if (editedScores[key] === undefined) {
      return item.score ?? "";
    }

    return editedScores[key];
  };

  /*
   * --------------------------------------------------
   * LIVE EDITED TOTAL / AVERAGE
   * --------------------------------------------------
   */

  const totalSubjects = subjectScores.length;

  const editedTotal = useMemo(() => {
    return subjectScores.reduce((total, item) => {
      const score = getEditedScore(item);

      if (score === "" || score === null || score === undefined) {
        return total;
      }

      return total + Number(score || 0);
    }, 0);
  }, [subjectScores, editedScores]);

  const editedAverage = useMemo(() => {
    if (!totalSubjects) {
      return 0;
    }

    return editedTotal / totalSubjects;
  }, [editedTotal, totalSubjects]);

  /*
   * --------------------------------------------------
   * DISPLAY TOTAL / AVERAGE
   * --------------------------------------------------
   */

  const calculatedTotal = useMemo(() => {
    return subjectScores.reduce(
      (total, item) => total + Number(item.score || 0),
      0
    );
  }, [subjectScores]);

  const calculatedAverage = useMemo(() => {
    if (!totalSubjects) {
      return 0;
    }

    return calculatedTotal / totalSubjects;
  }, [calculatedTotal, totalSubjects]);

  const displayTotal = editing
    ? editedTotal
    : result?.total_score !== null &&
      result?.total_score !== undefined
    ? Number(result.total_score)
    : calculatedTotal;

  const displayAverage = editing
    ? editedAverage
    : result?.average_score !== null &&
      result?.average_score !== undefined
    ? Number(result.average_score)
    : calculatedAverage;

  const studentClass = result
    ? `${result.level} ${result.grade}`
    : "";

  /*
   * --------------------------------------------------
   * SAVE EDITED RESULT
   * --------------------------------------------------
   */

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      const subjectScoresPayload = subjectScores.map((item) => {
        const subjectKey = item.id || item.subject;
        const score = getEditedScore(item);

        return {
          /*
           * Existing SubjectScore may expose `subject`
           * as the subject ID.
           */
          subject:
            item.subject ??
            item.subject_id,

          score:
            score === "" || score === null
              ? 0
              : Number(score),
        };
      });

      const payload = {
        student: result.student,
        level: result.level,
        grade: result.grade,
        term: result.term,
        academic_session: result.academic_session,

        subject_scores: subjectScoresPayload,

        teacher_remark: teacherRemark.trim(),
        principal_remark: principalRemark.trim(),
      };

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}results/${id}/`,
        payload
      );

      /*
       * Replace the local result with the server response.
       */
      setResult(response.data);

      setEditedScores({});
      setTeacherRemark("");
      setPrincipalRemark("");
      setEditing(false);
    } catch (err) {
      console.error("Failed to update result:", err);

      const responseData = err?.response?.data;

      if (responseData?.detail) {
        setSaveError(responseData.detail);
      } else if (typeof responseData === "object") {
        const messages = Object.values(responseData)
          .flat()
          .filter(Boolean)
          .join(" ");

        setSaveError(
          messages || "Could not update this result."
        );
      } else {
        setSaveError(
          "Could not update this result. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
   * --------------------------------------------------
   * PRINT
   * --------------------------------------------------
   */

  const handlePrint = () => {
    if (editing) {
      return;
    }

    window.print();
  };

  /*
   * --------------------------------------------------
   * LOADING
   * --------------------------------------------------
   */

  if (loading) {
    return (
      <div activePage="results">
        <div className="flex items-center justify-center py-24 text-sm text-slate-400">
          Loading result...
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * ERROR
   * --------------------------------------------------
   */

  if (error || !result) {
    return (
      <div activePage="results">
        <div className="py-16">
          <button
            type="button"
            onClick={() => navigate("/results")}
            className="text-sm text-[#0A2472] hover:underline mb-5"
          >
            ← Back to Results
          </button>

          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <h1 className="text-lg font-semibold text-slate-700 mb-2">
              {error || "Result not found."}
            </h1>

            <p className="text-sm text-slate-400 mb-5">
              The requested student result could not be loaded.
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-[#0A2472] text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Back to Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * PAGE
   * --------------------------------------------------
   */

  return (
    <div activePage="results">
      <div className="print:p-0">

        {/* ------------------------------------------ */}
        {/* TOP ACTIONS */}
        {/* ------------------------------------------ */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 print:hidden">
          <button
            type="button"
            onClick={() => {
              if (editing) {
                cancelEditing();
              } else {
                navigate("/results");
              }
            }}
            className="text-sm text-slate-500 hover:text-[#0A2472]"
          >
            {editing ? "← Cancel Editing" : "← Back to Results"}
          </button>

          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[#0A2472] text-white text-sm font-medium hover:bg-[#081d5d] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={startEditing}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Edit Result
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-lg bg-[#0A2472] text-white text-sm font-medium hover:bg-[#081d5d]"
                >
                  Print Result
                </button>
              </>
            )}
          </div>
        </div>

        {/* ------------------------------------------ */}
        {/* SAVE ERROR */}
        {/* ------------------------------------------ */}

        {saveError && (
          <div className="max-w-5xl mx-auto mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 print:hidden">
            {saveError}
          </div>
        )}

        {/* ------------------------------------------ */}
        {/* RESULT SHEET */}
        {/* ------------------------------------------ */}

        <div className="max-w-5xl mx-auto bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden print:shadow-none print:border-0 print:rounded-none">

          {/* ---------------------------------------- */}
          {/* SCHOOL HEADER */}
          {/* ---------------------------------------- */}

          <div className="px-6 sm:px-10 py-8 text-center border-b border-slate-200">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
              LOGO
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-slate-800">
              SCHOOL NAME
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              School Address
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Phone: 0800 000 0000 • Email: school@example.com
            </p>

            <div className="mt-6">
              <h2 className="text-lg font-bold uppercase tracking-wide text-slate-800">
                Student Report Sheet
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {result.term} • {result.academic_session}
              </p>
            </div>
          </div>

          {/* ---------------------------------------- */}
          {/* STUDENT INFORMATION */}
          {/* ---------------------------------------- */}

          <div className="px-6 sm:px-10 py-6 border-b border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Student Name
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {result.student_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Student ID
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {result.student_id || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Class
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {studentClass || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Term
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {result.term || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Academic Session
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {result.academic_session || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Class Moderator
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-1">
                  Not connected yet
                </p>
              </div>

            </div>
          </div>

          {/* ---------------------------------------- */}
          {/* RESULTS TABLE */}
          {/* ---------------------------------------- */}

          <div className="px-6 sm:px-10 py-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200">

                    <th className="text-left px-4 py-3 font-semibold text-slate-600 w-12">
                      #
                    </th>

                    <th className="text-left px-4 py-3 font-semibold text-slate-600">
                      Subject
                    </th>

                    <th className="text-center px-4 py-3 font-semibold text-slate-600 w-32">
                      Score / 100
                    </th>

                    <th className="text-center px-4 py-3 font-semibold text-slate-600 w-24">
                      Grade
                    </th>

                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">
                      Remark
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {subjectScores.length > 0 ? (
                    subjectScores.map((item, index) => {
                      const score = editing
                        ? getEditedScore(item)
                        : item.score;

                      const grade = getGrade(score);

                      return (
                        <tr
                          key={item.id || item.subject}
                          className="border-b border-slate-100"
                        >
                          <td className="px-4 py-3 text-slate-400">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3 font-medium text-slate-800">
                            {item.subject_name || "Subject"}
                          </td>

                          <td className="px-4 py-3 text-center font-semibold text-slate-800">

                            {editing ? (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={score}
                                onChange={(event) =>
                                  handleScoreChange(
                                    item.id || item.subject,
                                    event.target.value
                                  )
                                }
                                className="w-24 mx-auto border border-slate-300 rounded-md px-2.5 py-2 text-sm text-center outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
                              />
                            ) : (
                              formatScore(score)
                            )}

                          </td>

                          <td className="px-4 py-3 text-center font-semibold text-slate-800">
                            {grade}
                          </td>

                          <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                            {getGradeLabel(grade)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-slate-400"
                      >
                        No subject scores have been entered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---------------------------------------- */}
          {/* SUMMARY */}
          {/* ---------------------------------------- */}

          <div className="px-6 sm:px-10 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Total Score
                </p>

                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {formatScore(displayTotal)}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Across {totalSubjects} subject
                  {totalSubjects === 1 ? "" : "s"}
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Average Score
                </p>

                <p className="text-2xl font-bold text-[#0A2472] mt-1">
                  {formatScore(displayAverage)}%
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Position
                </p>

                <p className="text-2xl font-bold text-slate-800 mt-1">
                  —
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  To be implemented
                </p>
              </div>

            </div>
          </div>

          {/* ---------------------------------------- */}
          {/* REMARKS */}
          {/* ---------------------------------------- */}

          <div className="px-6 sm:px-10 py-6 border-t border-slate-200">
            <div className="grid grid-cols-1 gap-6">

              {/* Teacher remark */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">
                  Class Teacher's Remark
                </h3>

                {editing ? (
                  <textarea
                    rows={3}
                    value={teacherRemark}
                    onChange={(event) =>
                      setTeacherRemark(event.target.value)
                    }
                    placeholder="Enter class teacher's remark..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none resize-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
                  />
                ) : (
                  <div className="min-h-[70px] border border-dashed border-slate-300 rounded-lg px-4 py-4 text-sm text-slate-400">
                    {result?.teacher_remark ||
                      "Class teacher's remark will appear here."}
                  </div>
                )}
              </div>

              {/* Principal remark */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">
                  Principal's Remark
                </h3>

                {editing ? (
                  <textarea
                    rows={3}
                    value={principalRemark}
                    onChange={(event) =>
                      setPrincipalRemark(event.target.value)
                    }
                    placeholder="Enter principal's remark..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none resize-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
                  />
                ) : (
                  <div className="min-h-[70px] border border-dashed border-slate-300 rounded-lg px-4 py-4 text-sm text-slate-400">
                    {result?.principal_remark ||
                      "Principal's remark will appear here."}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ---------------------------------------- */}
          {/* SIGNATURES */}
          {/* ---------------------------------------- */}

          <div className="px-6 sm:px-10 py-6 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

              <div>
                <div className="border-b border-slate-300 h-8" />

                <p className="text-xs text-slate-400 mt-2">
                  Class Moderator
                </p>
              </div>

              <div>
                <div className="border-b border-slate-300 h-8" />

                <p className="text-xs text-slate-400 mt-2">
                  Principal
                </p>
              </div>

              <div>
                <p>{dateCreated}</p>
                <div className="border-b border-slate-300 h-2" />
                <p className="text-xs text-slate-400 mt-2">
                  Date
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ------------------------------------------ */}
      {/* PRINT STYLING */}
      {/* ------------------------------------------ */}

      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 12mm;
            }

            body {
              background: white !important;
            }

            .print\\:hidden {
              display: none !important;
            }

            input,
            textarea {
              border: none !important;
              box-shadow: none !important;
              outline: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}