// Roles are grouped into three buckets for filtering/display purposes.
const ADMIN_ROLES = ["Principal", "Vice Principal"];

export function isTeacher(staff) {
  return staff.role === "Teacher";
}

export function isAdministrator(staff) {
  return ADMIN_ROLES.includes(staff.role);
}

export function isSupportStaff(staff) {
  return !isTeacher(staff) && !isAdministrator(staff);
}

// Unique "Level Grade" labels a teacher is assigned to, e.g. ["JSS 1", "JSS 2"].
export function getClassLabels(staff) {
  const labels = (staff.assignments ?? []).map(
    (a) => `${a.level} ${a.grade}`
  );

  return [...new Set(labels)];
}

// Unique subject names a teacher teaches.
export function getSubjectNames(staff) {
  const names = (staff.assignments ?? []).map(
    (a) => a.subject.name
  );

  return [...new Set(names)];
}

export function getInitials(staff) {
  return `${staff.first_name[0] ?? ""}${staff.last_name[0] ?? ""}`.toUpperCase();
}

export function getFullName(staff) {
  return `${staff.first_name} ${staff.last_name}`;
}
