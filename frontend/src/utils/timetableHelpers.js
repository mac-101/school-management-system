export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const LEVELS = ["Primary", "JSS", "SSS"];

const LEVEL_ORDER = { Primary: 0, JSS: 1, SSS: 2 };

export function classroomLabel(classroom) {
  return `${classroom.level} ${classroom.grade}`;
}

// Sorts classrooms/periods-adjacent objects by level then grade.
export function classroomSortValue(classroom) {
  return (LEVEL_ORDER[classroom.level] ?? 99) * 100 + Number(classroom.grade || 0);
}

export function sortPeriods(periods) {
  return [...periods].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// "08:00:00" -> "08:00"
export function formatTime(time) {
  if (!time) return "";
  return time.slice(0, 5);
}

export function periodOptionLabel(period) {
  return `${period.name} — ${formatTime(period.start_time)} - ${formatTime(period.end_time)}`;
}

export function getStaffFullName(staff) {
  if (!staff) return "";
  const first = staff.first_name ?? staff.firstName ?? staff.name ?? staff.full_name ?? "";
  const last = staff.last_name ?? staff.lastName ?? "";
  return `${first}${last ? ` ${last}` : ""}`.trim();
}

// Prefer active teaching staff for the teacher dropdown.
export function isActiveTeacher(staff) {
  const activeFlag =
    staff.status === "Active" || staff.is_active === true || staff.active === true;
  return staff.role === "Teacher" && Boolean(activeFlag);
}

// Best-effort extraction of a human-readable message from a DRF error
// response, since validation errors can come back as `detail`,
// `non_field_errors`, or a per-field array depending on how the backend
// raised them.
export function extractErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (Array.isArray(data.non_field_errors)) return data.non_field_errors.join(" ");

  const firstField = Object.keys(data)[0];
  if (firstField) {
    const value = data[firstField];
    if (Array.isArray(value)) return value.join(" ");
    if (typeof value === "string") return value;
  }
  return fallback;
}
