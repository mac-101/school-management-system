import { useEffect, useRef, useState } from "react";
import { FILTERS } from "../utils/filters";

export default function LevelDropdownTab({ group, counts, activeFilter, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const options = group.options.map((key) => FILTERS.find((f) => f.key === key));

  // Tab counts as active if the level itself or one of its grades is selected.
  const selectedOption = options.find((o) => o.key === activeFilter);
  const isActive = activeFilter === group.key || Boolean(selectedOption);
  const displayLabel = selectedOption ? selectedOption.label : group.label;

  // Close the dropdown on outside click.
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (key) => {
    onChange(key);
    setOpen(false);
  };

  const handleToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={handleToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-1.5 px-1 py-3 text-sm border-b-2 -mb-px whitespace-nowrap transition-colors ${
          isActive
            ? "border-[#0A2472] text-[#0A2472] font-medium"
            : "border-transparent text-slate-500 hover:text-slate-700"
        }`}
      >
        <span>{displayLabel}</span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full ${
            isActive ? "bg-[#0A2472]/10 text-[#0A2472]" : "bg-slate-100 text-slate-500"
          }`}
        >
          {counts[group.key] ?? 0}
        </span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          onMouseDown={(event) => event.stopPropagation()}
          className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-[100]"
        >
          <button
            onClick={() => handleSelect(group.key)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-50 ${
              activeFilter === group.key ? "text-[#0A2472] font-medium" : "text-slate-700"
            }`}
          >
            <span>All {group.label}</span>
            <span className="text-xs text-slate-400">{counts[group.key] ?? 0}</span>
          </button>

          {options.map((option) => (
            <button
              key={option.key}
              onClick={() => handleSelect(option.key)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-50 ${
                activeFilter === option.key ? "text-[#0A2472] font-medium" : "text-slate-700"
              }`}
            >
              <span>{option.label}</span>
              <span className="text-xs text-slate-400">{counts[option.key] ?? 0}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
