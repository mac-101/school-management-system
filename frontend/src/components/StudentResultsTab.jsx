import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

function formatAverage(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "—";
    }

    return `${number.toFixed(1)}%`;
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function StudentResultsTab({ student, results }) {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const handleViewResult = (result) => {
        navigate(`/results/${result.id}`);
    };

    if (!student?.id) {
        return (
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
                <p className="text-sm text-slate-400">
                    Student information is unavailable.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Section header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-700">
                        Student Results
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                        Results recorded for {student.first_name}{" "}
                        {student.last_name}.
                    </p>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="bg-white border border-slate-200 rounded-lg py-16 text-center">
                    <p className="text-sm text-slate-400">
                        Loading results...
                    </p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="bg-white border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-sm text-red-500 mb-3">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchResults}
                        className="text-sm font-medium text-[#0A2472] hover:underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && results.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-lg py-16 text-center">
                    <p className="text-sm font-medium text-slate-500">
                        No results found.
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                        Results for this student will appear here once they
                        are added.
                    </p>
                </div>
            )}

            {/* Results table */}
            {!loading && !error && results.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left font-medium text-xs text-slate-500 px-4 py-3">
                                        Academic Session
                                    </th>

                                    <th className="text-left font-medium text-xs text-slate-500 px-4 py-3">
                                        Term
                                    </th>

                                    <th className="text-left font-medium text-xs text-slate-500 px-4 py-3">
                                        Class
                                    </th>

                                    <th className="text-left font-medium text-xs text-slate-500 px-4 py-3">
                                        Average
                                    </th>

                                    <th className="text-left font-medium text-xs text-slate-500 px-4 py-3">
                                        Date
                                    </th>

                                    <th className="text-right font-medium text-xs text-slate-500 px-4 py-3">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {results.map((result) => (
                                    <tr
                                        key={result.id}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-slate-700">
                                            {result.academic_session || "—"}
                                        </td>

                                        <td className="px-4 py-3 text-slate-700">
                                            {result.term || "—"}
                                        </td>

                                        <td className="px-4 py-3 text-slate-700">
                                            {result.level && result.grade
                                                ? `${result.level} ${result.grade}`
                                                : result.classroom_name ||
                                                result.class_name ||
                                                "—"}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="font-medium text-slate-700">
                                                {formatAverage(result.average_score)}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-slate-500">
                                            {formatDate(
                                                result.created_at ||
                                                result.date_created ||
                                                result.date
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleViewResult(result)
                                                }
                                                className="text-sm font-medium text-[#0A2472] hover:underline"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}