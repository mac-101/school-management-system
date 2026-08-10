export default function SchemeCard({ scheme }) {
  const weeks = scheme.weeks || [];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      {/* Subject -> Level + Grade -> Term + Session */}
      <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{scheme.subject_name}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {scheme.term} • {scheme.academic_session}
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium bg-[#0A2472]/10 text-[#0A2472] px-2.5 py-1 rounded-full whitespace-nowrap">
          {scheme.level} {scheme.grade}
        </span>
      </div>

      {/* Weeks -> Topic -> Subtopics */}
      {weeks.length === 0 ? (
        <p className="text-sm text-slate-400">No weeks added yet.</p>
      ) : (
        <div className="space-y-4">
          {weeks.map((week) => {
            const subtopics = week.subtopics || [];
            return (
              <div key={week.id}>
                <p className="text-xs font-medium text-[#0A2472] mb-1">
                  Week {week.week_number}
                </p>
                <p className="text-sm font-medium text-slate-800 mb-1">{week.topic}</p>
                {subtopics.length === 0 ? (
                  <p className="text-sm text-slate-400">No subtopics added yet.</p>
                ) : (
                  <ul className="text-sm text-slate-600 space-y-0.5">
                    {subtopics.map((subtopic) => (
                      <li key={subtopic.id}>• {subtopic.title}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
