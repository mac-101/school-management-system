import { useMemo } from "react";

export default function ResultsOverview({ results = [] }) {
  const stats = useMemo(() => {
    if (results.length === 0) return { total: 0, avgScore: 0, sessions: 0 };

    const total = results.length;
    const avgScore =
      results.reduce((sum, r) => sum + (r.average_score || 0), 0) / total || 0;
    const sessions = new Set(results.map((r) => r.academic_session)).size;

    return { total, avgScore: avgScore.toFixed(1), sessions };
  }, [results]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Results Overview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Key metrics across all results.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Total Results */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase">
            Total Results
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {stats.total}
          </div>
        </div>

        {/* Average Score */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase">
            Average Score
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {stats.avgScore}%
          </div>
        </div>

        {/* Academic Sessions */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase">
            Sessions
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {stats.sessions}
          </div>
        </div>
      </div>
    </div>
  );
}
