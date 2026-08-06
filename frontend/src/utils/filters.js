import { isTeacher, isAdministrator, isSupportStaff } from "./staffHelpers";

// Central filter definitions. Add a new filter by adding one entry here —
// the toolbar and the filtering logic both read from this list.

export const FILTERS = [
  { key: "all", label: "All Students", test: () => true },
  { key: "primary", label: "Primary", test: (s) => s.level === "Primary" },
  { key: "jss", label: "JSS", test: (s) => s.level === "JSS" },
  { key: "sss", label: "SSS", test: (s) => s.level === "SSS" },
  { key: "primary-1", label: "Primary 1", test: (s) => s.level === "Primary" && Number(s.grade) === 1 },
  { key: "primary-2", label: "Primary 2", test: (s) => s.level === "Primary" && Number(s.grade) === 2 },
  { key: "primary-3", label: "Primary 3", test: (s) => s.level === "Primary" && Number(s.grade) === 3 },
  { key: "primary-4", label: "Primary 4", test: (s) => s.level === "Primary" && Number(s.grade) === 4 },
  { key: "primary-5", label: "Primary 5", test: (s) => s.level === "Primary" && Number(s.grade) === 5 },
  { key: "jss-1", label: "JSS 1", test: (s) => s.level === "JSS" && Number(s.grade) === 1 },
  { key: "jss-2", label: "JSS 2", test: (s) => s.level === "JSS" && Number(s.grade) === 2 },
  { key: "jss-3", label: "JSS 3", test: (s) => s.level === "JSS" && Number(s.grade) === 3 },
  { key: "sss-1", label: "SSS 1", test: (s) => s.level === "SSS" && Number(s.grade) === 1 },
  { key: "sss-2", label: "SSS 2", test: (s) => s.level === "SSS" && Number(s.grade) === 2 },
  { key: "sss-3", label: "SSS 3", test: (s) => s.level === "SSS" && Number(s.grade) === 3 },
  {
    key: "outstanding",
    label: "Outstanding Fees",
    test: (s) => Number(s.student_fee) - Number(s.amount_paid) > 0,
  },
];

// Groups the per-grade filters under their parent level, so the toolbar can
// render "Primary / JSS / SSS" as single tabs that expand into a dropdown.
export const LEVEL_GROUPS = [
  {
    key: "primary",
    label: "Primary",
    options: ["primary-1", "primary-2", "primary-3", "primary-4", "primary-5"],
  },
  {
    key: "jss",
    label: "JSS",
    options: ["jss-1", "jss-2", "jss-3"],
  },
  {
    key: "sss",
    label: "SSS",
    options: ["sss-1", "sss-2", "sss-3"],
  },
];

export function filterStudents(students, activeFilter, searchTerm) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filter = FILTERS.find((f) => f.key === activeFilter) ?? FILTERS[0];

  return students.filter((student) => {
    const matchesFilter = filter.test(student);
    if (!matchesFilter) return false;

    if (!normalizedSearch) return true;

    const fullName = `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim().toLowerCase();
    const levelGrade = `${student.level ?? ""} ${student.grade ?? ""}`.trim().toLowerCase();
    const searchableText = [fullName, levelGrade, student.gender, student.level, student.grade].join(" ").toLowerCase();

    return searchableText.includes(normalizedSearch);
  });
}


// Single source of truth for the filter tabs — bar and counts both read this.
export const STAFF_FILTERS = [
  { key: "all", label: "All", test: () => true },
  { key: "teachers", label: "Teachers", test: isTeacher },
  { key: "administrators", label: "Administrators", test: isAdministrator },
  { key: "support", label: "Support Staff", test: isSupportStaff },
  { key: "fulltime", label: "Full-time", test: (s) => s.employment_type === "Full Time" },
  { key: "parttime", label: "Part-time", test: (s) => s.employment_type === "Part Time" },
  { key: "active", label: "Active", test: (s) => s.status === "Active" },
  { key: "inactive", label: "Inactive", test: (s) => s.status === "Inactive" },
];
