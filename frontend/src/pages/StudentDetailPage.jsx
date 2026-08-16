import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import StudentFormModal from "../components/StudentFormModal";
import StudentResultsTab from "../components/StudentResultsTab";
import ResultAnalytics from "../components/ResultAnalytics";
import { formatCurrency } from "../utils/formatCurrency";

const TABS = [
  "Overview",
  "Results",
  "Attendance",
  "Timetable",
  "Homework",
];

function BackArrow() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [activeTab, setActiveTab] = useState("Overview");

  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchStudent = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}students/${id}/`
      );

      const studentData = res.data;
      console.log("Fetched student:", studentData);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}results/?student=${studentData.id}`
      );

      console.log("Fetched results:", response.data);

      setStudent(studentData);

      setResults(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError("Could not load this student. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  // Auto-dismiss success toast.
  useEffect(() => {
    if (!toast) return;

    const timeoutId = setTimeout(
      () => setToast(null),
      3000
    );

    return () => clearTimeout(timeoutId);
  }, [toast]);

  const handleSaved = () => {
    setModalOpen(false);
    setToast("Student updated successfully.");
    fetchStudent();
  };

  const classLabel = student
    ? `${student.level} ${student.grade}`
    : "";

  const feeBalance = student
    ? Number(student.fee_balance)
    : 0;

  /*
   * --------------------------------------------------
   * TAB CONTENT
   * --------------------------------------------------
   */

  const renderTabContent = () => {
    if (activeTab === "Results") {
      return (
        <StudentResultsTab
          student={student}
          results={results}
        />
      );
    }

    if (activeTab === "Attendance") {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <p className="text-sm text-slate-400">
            Attendance will appear here once connected.
          </p>
        </div>
      );
    }

    if (activeTab === "Timetable") {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <p className="text-sm text-slate-400">
            Timetable will appear here once connected.
          </p>
        </div>
      );
    }

    if (activeTab === "Homework") {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <p className="text-sm text-slate-400">
            Homework will appear here once connected.
          </p>
        </div>
      );
    }

    /*
     * Default = Overview
     */

    return (
      <>
        {/* Student Information */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Student Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField
              label="Name"
              value={`${student.first_name} ${student.last_name}`}
            />

            <InfoField
              label="Student ID"
              value={student.student_id}
            />

            <InfoField
              label="Age"
              value={student.age}
            />

            <InfoField
              label="Gender"
              value={student.gender}
            />

            <InfoField
              label="Class"
              value={classLabel}
            />
          </div>
        </div>

        {/* Fees */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Fees
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoField
              label="Student Fee"
              value={formatCurrency(student.student_fee)}
            />

            <InfoField
              label="Amount Paid"
              value={formatCurrency(student.amount_paid)}
            />

            <div>
              <p className="text-xs text-slate-500 mb-1">
                Balance
              </p>

              <p
                className={`text-sm font-semibold ${feeBalance > 0
                  ? "text-red-600"
                  : "text-emerald-600"
                  }`}
              >
                {formatCurrency(feeBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Future modules */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 text-center text-sm text-slate-400">
          {/* Results, Attendance, Timetable and Homework
          will appear here once connected. */}
          <ResultAnalytics
            results={results}
            studentId={student.id}
          />
        </div>
      </>
    );
  };

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate("/students")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0A2472] mb-4"
      >
        <BackArrow />
        Back to Students
      </button>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Loading student...
        </div>
      )}

      {/* Not found */}
      {!loading && notFound && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-sm text-slate-400">
            Student not found.
          </p>

          <button
            onClick={() => navigate("/students")}
            className="text-sm font-medium text-white bg-[#0A2472] px-4 py-2 rounded-lg"
          >
            Back to Students
          </button>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-sm text-red-500">
            {error}
          </p>

          <button
            onClick={() => navigate("/students")}
            className="text-sm font-medium text-white bg-[#0A2472] px-4 py-2 rounded-lg"
          >
            Back to Students
          </button>
        </div>
      )}

      {/* Student */}
      {!loading &&
        !error &&
        !notFound &&
        student && (
          <div>

            {/* -------------------------------------- */}
            {/* HEADER */}
            {/* -------------------------------------- */}

            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  {student.first_name}{" "}
                  {student.last_name}
                </h1>

                <p className="text-sm text-slate-500 mt-0.5">
                  {student.student_id} • {classLabel}
                </p>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="text-sm font-medium text-[#0A2472] border border-[#0A2472]/20 px-3 py-1.5 rounded-lg hover:bg-[#0A2472]/5 whitespace-nowrap"
              >
                Edit Student
              </button>
            </div>

            {/* -------------------------------------- */}
            {/* TABS */}
            {/* -------------------------------------- */}

            <div className="flex gap-6 overflow-x-auto border-b border-slate-200 mb-6">
              {TABS.map((tab) => {
                const enabled =
                  tab === "Overview" ||
                  tab === "Results";

                const isActive =
                  activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    disabled={!enabled}
                    onClick={() => {
                      if (enabled) {
                        setActiveTab(tab);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-1 py-3 text-sm border-b-2 -mb-px whitespace-nowrap transition-colors shrink-0 ${isActive
                      ? "border-[#0A2472] text-[#0A2472] font-medium"
                      : enabled
                        ? "border-transparent text-slate-500 hover:text-slate-700"
                        : "border-transparent text-slate-300 cursor-not-allowed"
                      }`}
                  >
                    {tab}

                    {!enabled && (
                      <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* -------------------------------------- */}
            {/* ACTIVE TAB */}
            {/* -------------------------------------- */}

            {renderTabContent()}
          </div>
        )}

      {/* Student Edit Modal */}
      <StudentFormModal
        open={modalOpen}
        student={student}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}