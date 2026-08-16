import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const TERMS = [
  "First Term",
  "Second Term",
  "Third Term",
];

function studentLabel(student) {
  const name = `${student.first_name || ""} ${student.last_name || ""}`.trim();
  return `${name} — ${student.student_id || ""}`;
}

function formatScore(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  return String(value);
}

export default function ResultFormModal({
  open,
  result = null,
  students = [],
  onClose,
  onSaved,
}) {
  const isEditMode = Boolean(result);

  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [level, setLevel] = useState("");
  const [grade, setGrade] = useState("");

  const [term, setTerm] = useState("");
  const [academicSession, setAcademicSession] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [scores, setScores] = useState({});

  const [teacherRemark, setTeacherRemark] = useState("");
  const [principalRemark, setPrincipalRemark] = useState("");

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  /*
   * --------------------------------------------------
   * INITIALIZE EDIT / ADD MODE
   * --------------------------------------------------
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setFieldErrors({});

    if (result) {
      setSelectedStudent({
        id: result.student,
        student_id: result.student_id,
        first_name: result.student_name?.split(" ")[0] || "",
        last_name:
          result.student_name
            ?.split(" ")
            .slice(1)
            .join(" ") || "",
        level: result.level,
        grade: result.grade,
      });

      setLevel(result.level || "");
      setGrade(result.grade ?? "");
      setTerm(result.term || "");
      setAcademicSession(result.academic_session || "");

      setTeacherRemark(result.teacher_remark || "");
      setPrincipalRemark(result.principal_remark || "");

      const initialScores = {};

      (result.subject_scores || []).forEach((item) => {
        initialScores[item.subject] = formatScore(item.score);
      });

      setScores(initialScores);

      setStudentSearch("");
    } else {
      setSelectedStudent(null);
      setStudentSearch("");
      setLevel("");
      setGrade("");
      setTerm("");
      setAcademicSession("");
      setSubjects([]);
      setScores({});
      setTeacherRemark("");
      setPrincipalRemark("");
    }
  }, [open, result]);

  /*
   * --------------------------------------------------
   * SEARCH STUDENTS
   * --------------------------------------------------
   */

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return students.filter((student) => {
      const name = `${student.first_name || ""} ${
        student.last_name || ""
      }`
        .trim()
        .toLowerCase();

      const id = (student.student_id || "").toLowerCase();

      return name.includes(query) || id.includes(query);
    });
  }, [students, studentSearch]);

  /*
   * --------------------------------------------------
   * FETCH SUBJECTS WHEN STUDENT / LEVEL IS KNOWN
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!open || !level) {
      setSubjects([]);
      return;
    }

    let cancelled = false;

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      setError(null);

      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }results/subjects/${encodeURIComponent(level)}/`
        );

        if (!cancelled) {
          setSubjects(
            Array.isArray(response.data)
              ? response.data
              : response.data?.results || []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not load subjects for this level.");
          setSubjects([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingSubjects(false);
        }
      }
    };

    fetchSubjects();

    return () => {
      cancelled = true;
    };
  }, [open, level]);

  /*
   * --------------------------------------------------
   * SELECT STUDENT
   * --------------------------------------------------
   */

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setStudentSearch("");

    setLevel(student.level || "");
    setGrade(student.grade ?? "");

    /*
     * Start all valid subjects with empty scores.
     */
    setScores({});
    setFieldErrors({});
    setError(null);
  };

  /*
   * --------------------------------------------------
   * SCORE CHANGE
   * --------------------------------------------------
   */

  const handleScoreChange = (subjectId, value) => {
    if (value === "") {
      setScores((prev) => ({
        ...prev,
        [subjectId]: "",
      }));
      return;
    }

    const numeric = Number(value);

    if (Number.isNaN(numeric)) {
      return;
    }

    if (numeric < 0 || numeric > 100) {
      return;
    }

    setScores((prev) => ({
      ...prev,
      [subjectId]: value,
    }));
  };

  /*
   * --------------------------------------------------
   * TOTAL + AVERAGE
   * --------------------------------------------------
   */

  const filledScores = subjects
    .map((subject) => Number(scores[subject.id]))
    .filter((score) => !Number.isNaN(score));

  const totalScore = filledScores.reduce(
    (total, score) => total + score,
    0
  );

  const averageScore =
    filledScores.length > 0
      ? totalScore / filledScores.length
      : 0;

  /*
   * --------------------------------------------------
   * VALIDATION
   * --------------------------------------------------
   */

  const validate = () => {
    const errors = {};

    if (!selectedStudent) {
      errors.student = "Select a student.";
    }

    if (!term) {
      errors.term = "Select a term.";
    }

    if (!academicSession.trim()) {
      errors.academic_session =
        "Academic session is required.";
    }

    const missingScores = subjects.filter(
      (subject) =>
        scores[subject.id] === "" ||
        scores[subject.id] === undefined
    );

    if (missingScores.length > 0) {
      errors.subject_scores =
        "Enter a score for every subject.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /*
   * --------------------------------------------------
   * SUBMIT
   * --------------------------------------------------
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const subjectScores = subjects.map((subject) => ({
      subject: subject.id,
      score: Number(scores[subject.id]),
    }));

    const payload = {
      student: Number(selectedStudent.id),
      level,
      grade: Number(grade),
      term,
      academic_session: academicSession.trim(),
      subject_scores: subjectScores,
      teacher_remark: teacherRemark.trim(),
      principal_remark: principalRemark.trim(),
    };

    console.log(payload)

    setSaving(true);
    setError(null);

    try {
      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}results/${result.id}/`,
          payload
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}results/`,
          payload
        );
      }

      onSaved?.(isEditMode);
    } catch (err) {
      const data = err?.response?.data;

      if (data && typeof data === "object") {
        if (data.detail) {
          setError(data.detail);
        } else {
          setError(
            Object.values(data)
              .flat()
              .join(" ")
          );
        }
      } else {
        setError(
          `Could not ${
            isEditMode ? "update" : "create"
          } this result.`
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-4xl max-h-[94vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
      >
        {/* ---------------------------------------- */}
        {/* HEADER */}
        {/* ---------------------------------------- */}

        <div className="px-6 sm:px-8 py-5 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                {isEditMode
                  ? "Edit Academic Result"
                  : "Academic Result Entry"}
              </p>

              <h2 className="text-xl font-semibold text-slate-800 mt-1">
                Student Result
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* -------------------------------------- */}
          {/* SCHOOL / STUDENT HEADER */}
          {/* -------------------------------------- */}

          <div className="px-6 sm:px-8 py-6">
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="text-center px-5 py-6 border-b border-slate-200 bg-slate-50">
                <div className="w-14 h-14 mx-auto mb-3 border border-dashed border-slate-300 rounded-full flex items-center justify-center text-[10px] text-slate-400">
                  LOGO
                </div>

                <h3 className="text-lg font-bold text-slate-800">
                  SCHOOL NAME
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  School address • Phone • Email
                </p>

                <p className="text-sm font-semibold text-slate-700 mt-4">
                  {term || "Term"} •{" "}
                  {academicSession || "Academic Session"}
                </p>
              </div>

              {/* Student selection */}
              <div className="px-5 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 relative">
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Student
                    </label>

                    {selectedStudent ? (
                      <div className="flex items-center justify-between border border-slate-300 rounded-lg px-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {studentLabel(selectedStudent)}
                          </p>

                          <p className="text-xs text-slate-400 mt-0.5">
                            {selectedStudent.level}{" "}
                            {selectedStudent.grade}
                          </p>
                        </div>

                        {!isEditMode && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudent(null);
                              setLevel("");
                              setGrade("");
                              setSubjects([]);
                              setScores({});
                            }}
                            className="text-xs text-[#0A2472] hover:underline"
                          >
                            Change
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={studentSearch}
                          onChange={(event) =>
                            setStudentSearch(
                              event.target.value
                            )
                          }
                          placeholder="Search name or student ID..."
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
                        />

                        {filteredStudents.length > 0 && (
                          <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredStudents.map(
                              (student) => (
                                <button
                                  type="button"
                                  key={student.id}
                                  onClick={() =>
                                    handleStudentSelect(
                                      student
                                    )
                                  }
                                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b last:border-b-0 border-slate-100"
                                >
                                  <p className="text-sm font-medium text-slate-700">
                                    {studentLabel(
                                      student
                                    )}
                                  </p>

                                  <p className="text-xs text-slate-400 mt-0.5">
                                    {student.level}{" "}
                                    {student.grade}
                                  </p>
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {fieldErrors.student && (
                      <p className="text-xs text-red-600 mt-1">
                        {fieldErrors.student}
                      </p>
                    )}
                  </div>

                  {/* Class */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Class
                    </label>

                    <div className="border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-sm text-slate-700">
                      {selectedStudent
                        ? `${level} ${grade}`
                        : "—"}
                    </div>
                  </div>

                  {/* Term */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Term
                    </label>

                    <select
                      value={term}
                      onChange={(event) =>
                        setTerm(event.target.value)
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
                    >
                      <option value="">
                        Select term
                      </option>

                      {TERMS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>

                    {fieldErrors.term && (
                      <p className="text-xs text-red-600 mt-1">
                        {fieldErrors.term}
                      </p>
                    )}
                  </div>

                  {/* Session */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Academic Session
                    </label>

                    <input
                      type="text"
                      value={academicSession}
                      onChange={(event) =>
                        setAcademicSession(
                          event.target.value
                        )
                      }
                      placeholder="2026/2027"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
                    />

                    {fieldErrors.academic_session && (
                      <p className="text-xs text-red-600 mt-1">
                        {fieldErrors.academic_session}
                      </p>
                    )}
                  </div>

                  {/* Class moderator placeholder */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Class Moderator
                    </label>

                    <div className="border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-sm text-slate-400">
                      Will be connected
                    </div>
                  </div>
                </div>
              </div>

              {/* ---------------------------------- */}
              {/* SUBJECT SCORES */}
              {/* ---------------------------------- */}

              <div className="px-5 pb-5">
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700">
                      Subject Scores
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Subjects are automatically loaded from
                      the student's level.
                    </p>
                  </div>

                  {loadingSubjects ? (
                    <div className="py-12 text-center text-sm text-slate-400">
                      Loading subjects...
                    </div>
                  ) : !selectedStudent ? (
                    <div className="py-12 text-center text-sm text-slate-400">
                      Select a student to load the subjects.
                    </div>
                  ) : subjects.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-400">
                      No subjects are configured for this
                      level.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-[1fr_120px] px-4 py-2.5 text-xs font-medium text-slate-500 border-b border-slate-200">
                        <span>Subject</span>
                        <span className="text-center">
                          Score / 100
                        </span>
                      </div>

                      {subjects.map((subject) => (
                        <div
                          key={subject.id}
                          className="grid grid-cols-[1fr_120px] items-center gap-4 px-4 py-3 border-b border-slate-100 last:border-b-0"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {subject.name}
                            </p>
                          </div>

                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={
                              scores[subject.id] ?? ""
                            }
                            onChange={(event) =>
                              handleScoreChange(
                                subject.id,
                                event.target.value
                              )
                            }
                            className="w-full border border-slate-300 rounded-md px-2.5 py-2 text-sm text-center outline-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
                            placeholder="0-100"
                          />
                        </div>
                      ))}
                    </>
                  )}

                  {fieldErrors.subject_scores && (
                    <div className="px-4 py-3 bg-red-50 border-t border-red-100 text-xs text-red-600">
                      {fieldErrors.subject_scores}
                    </div>
                  )}
                </div>
              </div>

              {/* ---------------------------------- */}
              {/* RESULT SUMMARY */}
              {/* ---------------------------------- */}

              <div className="px-5 pb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Total Score
                    </p>

                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {totalScore.toFixed(2).replace(
                        /\.00$/,
                        ""
                      )}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      From {subjects.length} subjects
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Average
                    </p>

                    <p className="text-2xl font-bold text-[#0A2472] mt-1">
                      {averageScore.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* ---------------------------------- */}
              {/* REMARKS */}
              {/* ---------------------------------- */}

              <div className="px-5 pb-6">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Class Teacher's Remark
                    </label>

                    <textarea
                      rows={3}
                      value={teacherRemark}
                      onChange={(event) =>
                        setTeacherRemark(
                          event.target.value
                        )
                      }
                      placeholder="Enter class teacher's remark..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none resize-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Principal's Remark
                    </label>

                    <textarea
                      rows={3}
                      value={principalRemark}
                      onChange={(event) =>
                        setPrincipalRemark(
                          event.target.value
                        )
                      }
                      placeholder="Enter principal's remark..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none resize-none focus:border-[#0A2472] focus:ring-1 focus:ring-[#0A2472]/30"
                    />
                  </div>
                </div>
              </div>

              {/* ---------------------------------- */}
              {/* ERROR */}
              {/* ---------------------------------- */}

              {error && (
                <div className="mx-5 mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* ---------------------------------- */}
              {/* ACTIONS */}
              {/* ---------------------------------- */}

              <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-[#0A2472] text-white text-sm font-medium hover:bg-[#081d5d] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Saving Result..."
                    : isEditMode
                    ? "Save Changes"
                    : "Save Result"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}