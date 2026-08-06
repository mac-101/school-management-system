import { STAFF_FILTERS } from "../utils/filters";

export default function FilterBar({ counts, activeFilter, onChange }) {
  return (
    <div className="flex gap-6 overflow-x-auto border-b border-slate-200 mb-6">
      {STAFF_FILTERS.map((filter) => {
        const isActive = filter.key === activeFilter;
        return (
          <button
            key={filter.key}
            onClick={() => onChange(filter.key)}
            className={`flex items-center gap-1.5 px-1 py-3 text-sm border-b-2 -mb-px whitespace-nowrap transition-colors shrink-0 ${
              isActive
                ? "border-[#0A2472] text-[#0A2472] font-medium"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>{filter.label}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-[#0A2472]/10 text-[#0A2472]" : "bg-slate-100 text-slate-500"
              }`}
            >
              {counts[filter.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
