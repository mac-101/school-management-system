import LevelDropdownTab from "./LevelDropdownTab";
import { LEVEL_GROUPS } from "../utils/filters";

function SimpleTab({ filterKey, label, count, activeFilter, onChange }) {
  const isActive = activeFilter === filterKey;
  return (
    <button
      onClick={() => onChange(filterKey)}
      className={`flex items-center gap-1.5 px-1 py-3 text-sm border-b-2 -mb-px whitespace-nowrap transition-colors shrink-0 ${
        isActive
          ? "border-[#0A2472] text-[#0A2472] font-medium"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      <span>{label}</span>
      <span
        className={`text-xs px-1.5 py-0.5 rounded-full ${
          isActive ? "bg-[#0A2472]/10 text-[#0A2472]" : "bg-slate-100 text-slate-500"
        }`}
      >
        {count ?? 0}
      </span>
    </button>
  );
}

export default function StudentFilterBar({ counts, activeFilter, onChange }) {
  return (
    <div className="relative flex gap-6 overflow-visible border-b border-slate-200 mb-6">
      <SimpleTab
        filterKey="all"
        label="All Students"
        count={counts.all}
        activeFilter={activeFilter}
        onChange={onChange}
      />

      {LEVEL_GROUPS.map((group) => (
        <LevelDropdownTab
          key={group.key}
          group={group}
          counts={counts}
          activeFilter={activeFilter}
          onChange={onChange}
        />
      ))}

      <SimpleTab
        filterKey="outstanding"
        label="Outstanding Fees"
        count={counts.outstanding}
        activeFilter={activeFilter}
        onChange={onChange}
      />
    </div>
  );
}