import { DAYS, formatTime, sortPeriods } from "../utils/timetableHelpers";

function PencilIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

export default function TimetableGrid({ periods, entries, deletingId, onCellClick, onEdit, onDelete }) {
  const orderedPeriods = sortPeriods(periods);

  const findEntry = (periodId, day) =>
    entries.find((e) => e.period === periodId && e.day === day);

  if (orderedPeriods.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg py-16 text-center text-sm text-slate-400">
        No periods have been set up yet.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left text-slate-500 font-medium px-4 py-3 w-40 whitespace-nowrap">
              Period
            </th>
            {DAYS.map((day) => (
              <th
                key={day}
                className="text-left text-slate-500 font-medium px-4 py-3 whitespace-nowrap"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orderedPeriods.map((period) => (
            <tr key={period.id} className="border-b border-slate-100 last:border-b-0">
              <td className="px-4 py-3 align-top">
                <p className="font-medium text-slate-800">{period.name}</p>
                <p className="text-xs text-slate-400">
                  {formatTime(period.start_time)} - {formatTime(period.end_time)}
                </p>
              </td>

              {DAYS.map((day) => {
                const entry = findEntry(period.id, day);
                const isDeleting = entry && entry.id === deletingId;
                return (
                  <td key={day} className="px-2 py-2 align-top">
                    {entry ? (
                      <div
                        className={`group relative bg-[#0A2472]/5 border border-[#0A2472]/10 rounded-lg px-3 py-2 min-w-[140px] ${
                          isDeleting ? "opacity-40" : ""
                        }`}
                      >
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {entry.subject_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{entry.teacher_name}</p>
                        {entry.room && (
                          <p className="text-xs text-slate-400 truncate">Room {entry.room}</p>
                        )}

                        <div className="hidden group-hover:flex items-center gap-2 absolute top-1.5 right-1.5 bg-white border border-slate-200 rounded-md px-1 py-0.5 shadow-sm">
                          <button
                            onClick={() => onEdit(entry)}
                            disabled={isDeleting}
                            className="text-slate-500 hover:text-[#0A2472] p-0.5 disabled:opacity-50"
                            title="Edit"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            onClick={() => onDelete(entry)}
                            disabled={isDeleting}
                            className="text-slate-500 hover:text-red-600 p-0.5 disabled:opacity-50"
                            title="Delete"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => onCellClick(day, period.id)}
                        className="w-full h-full min-h-[52px] min-w-[140px] flex items-center justify-center text-slate-300 hover:text-[#0A2472] hover:bg-slate-50 rounded-lg text-sm"
                        title="Add entry"
                      >
                        —
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
