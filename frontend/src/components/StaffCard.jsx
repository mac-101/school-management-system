import { useState } from "react";
import StatusBadge from "./StatusBadge";
import {
  isTeacher,
  getClassLabels,
  getSubjectNames,
  getInitials,
  getFullName,
} from "../utils/staffHelpers";

export default function StaffCard({ staff, onView, onEdit, onDelete }) {
  const teacher = isTeacher(staff);
  const subjects = teacher ? getSubjectNames(staff) : [];
  const classes = teacher ? getClassLabels(staff) : [];
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const moderatorLabel = staff.class_moderator
    ? `${staff.class_moderator.level} ${staff.class_moderator.grade}`
    : null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-[#0A2472]/10 text-[#0A2472] flex items-center justify-center text-sm font-semibold shrink-0">
          {getInitials(staff)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-800 truncate">{getFullName(staff)}</p>
          <p className="text-sm text-slate-500">{staff.role}</p>
        </div>
        <StatusBadge status={staff.status} />
      </div>

      {/* Employment type */}
      <div className="mb-3">
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
          {staff.employment_type}
        </span>
      </div>

      {/* Contact */}
      <div className="text-sm text-slate-600 space-y-1 mb-4">
        <p className="truncate">{staff.phone}</p>
        <p className="truncate">{staff.email}</p>
      </div>



      {/* Teaching info */}
      <div>
        {teacher && (
          <>
            <button
              onClick={() => setShowAllSubjects(!showAllSubjects)}
              className="text-[#0A2472] hover:underline text-xs font-medium"
            >
              {showAllSubjects ? "Show Less" : "Show More"}
            </button>

            {showAllSubjects && (subjects.length > 0 || classes.length > 0) && (
              <div className="border-t border-slate-100 pt-3 mb-3 space-y-2">
                {subjects.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Subjects</p>
                    <ul className="text-sm text-slate-700 space-y-0.5">
                      {subjects.map((name) => (
                        <li key={name}>• {name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {classes.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Classes</p>
                    <ul className="text-sm text-slate-700 space-y-0.5">
                      {classes.map((label) => (
                        <li key={label}>• {label}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Class moderator */}
      {moderatorLabel && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
            Class Moderator · {moderatorLabel}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-4">
        <button
          onClick={() => onView?.(staff)}
          className="text-[#0A2472] hover:underline text-xs font-medium"
        >
          View
        </button>
        <button
          onClick={() => onEdit?.(staff)}
          className="text-slate-600 hover:underline text-xs font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete?.(staff)}
          className="text-red-600 hover:underline text-xs font-medium ml-auto"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
