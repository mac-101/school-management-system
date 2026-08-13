import React, { useMemo } from "react";
import {
  DAYS,
  classroomLabel,
  classroomSortValue,
  sortPeriods,
  formatTime,
} from "../utils/timetableHelpers";

export default function TimetableGrid({
  classrooms = [],
  periods = [],
  entries = [],
  onEdit,
  onDelete,
  onCellClick,
  selectedDay = "All",
}) {
  const sortedClassrooms = useMemo(() => {
    return [...classrooms].sort(
      (a, b) => classroomSortValue(a) - classroomSortValue(b)
    );
  }, [classrooms]);

  const sortedPeriods = useMemo(() => {
    return sortPeriods(periods);
  }, [periods]);

  const daysToShow = selectedDay === "All" ? DAYS : [selectedDay];

  /*
   * Fast lookup:
   *
   * day + classroom + period
   *
   * Example:
   * Monday-JSS 1-Period 1
   */
  const entryMap = useMemo(() => {
    const map = new Map();

    for (const entry of entries) {
      const key = `${entry.day}-${entry.classroom}-${entry.period}`;
      map.set(key, entry);
    }

    return map;
  }, [entries]);

  const getEntry = (day, classroomId, periodId) => {
    return entryMap.get(`${day}-${classroomId}-${periodId}`);
  };

  if (!sortedClassrooms.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">
          No classrooms available.
        </p>
      </div>
    );
  }

  if (!sortedPeriods.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">
          No periods have been configured.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {daysToShow.map((day) => (
        <section key={day}>
          {/* Day heading */}
          <div className="mb-3">
            <h2 className="text-base font-semibold text-slate-800">
              {day}
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  {/* Classroom column */}
                  <th className="sticky left-0 z-10 w-28 min-w-28 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Class
                  </th>

                  {/* Period columns */}
                  {sortedPeriods.map((period) => (
                    <th
                      key={period.id}
                      className="border-b border-r border-slate-200 px-3 py-3 text-center last:border-r-0"
                    >
                      <div className="text-xs font-semibold text-slate-700">
                        {period.name}
                      </div>

                      <div className="mt-1 text-[11px] font-normal text-slate-400">
                        {formatTime(period.start_time)} -{" "}
                        {formatTime(period.end_time)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {sortedClassrooms.map((classroom) => (
                  <tr
                    key={classroom.id}
                    className="hover:bg-slate-50/50"
                  >
                    {/* Classroom */}
                    <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-4 text-left text-sm font-semibold text-slate-700">
                      {classroomLabel(classroom)}
                    </th>

                    {/* Periods */}
                    {sortedPeriods.map((period) => {
                      const entry = getEntry(
                        day,
                        classroom.id,
                        period.id
                      );

                      return (
                        <td
                          key={period.id}
                          className="border-b border-r border-slate-200 p-1 last:border-r-0"
                        >
                          {entry ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (onEdit) {
                                  onEdit(entry);
                                  return;
                                }

                                if (onCellClick) {
                                  onCellClick(entry.classroom ? entry.classroom : entry, entry.day, entry.period);
                                }
                              }}
                              className="flex min-h-[64px] w-full items-center justify-center rounded-lg px-2 py-3 text-center transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0A2472]/30"
                            >
                              <span className="text-sm font-medium text-slate-800">
                                {entry.subject_name}
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (onCellClick) {
                                  onCellClick(classroom, day, period.id);
                                }
                              }}
                              className="min-h-[64px] w-full rounded-lg text-slate-300 transition hover:bg-slate-50 hover:text-slate-400"
                              aria-label={`Add ${day} ${classroomLabel(
                                classroom
                              )} ${period.name}`}
                            >
                              <span className="text-xs">—</span>
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
        </section>
      ))}
    </div>
  );
}