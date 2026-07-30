// Fixed class structure so every class shows up (even with 0 students).
export const CLASS_STRUCTURE = {
  Primary: [1, 2, 3, 4, 5],
  JSS: [1, 2, 3],
  SSS: [1, 2, 3],
};

/**
 * Groups a flat list of students into:
 * [
 *   { level: "Primary", classes: [{ className: "Primary 1", students: [...] }, ...] },
 *   { level: "JSS", classes: [...] },
 *   { level: "SSS", classes: [...] },
 * ]
 */
export function groupStudentsByClass(students) {
  return Object.entries(CLASS_STRUCTURE).map(([level, grades]) => {
    const classes = grades.map((grade) => {
      const className = `${level} ${grade}`;
      const classStudents = students.filter(
        (s) => s.level === level && Number(s.grade) === grade
      );
      return { className, level, grade, students: classStudents };
    });

    return { level, classes };
  });
}
