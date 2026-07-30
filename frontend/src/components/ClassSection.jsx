import { useState } from "react";
import StudentTable from "./StudentTable";

export default function ClassSection({ className, students, onEdit, onDelete }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white border border-slate-200 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-800">{className}</span>
          <span className="text-xs bg-[#0A2472]/10 text-[#0A2472] px-2 py-0.5 rounded-full">
            {students.length} {students.length === 1 ? "student" : "students"}
          </span>
        </div>
        <span
          className={`text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="px-5 py-3">
          <StudentTable
            students={students}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
}
