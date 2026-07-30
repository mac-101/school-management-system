import ClassSection from "./ClassSection";

export default function LevelGroup({ level, classes, onEdit, onDelete }) {
  const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0);

  return (
    <section className="mb-8">
      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="text-lg font-semibold text-slate-800">{level}</h2>
        <span className="text-sm text-slate-400">({totalStudents} total)</span>
      </div>

      {classes.map((c) => (
        <ClassSection
          key={c.className}
          className={c.className}
          students={c.students}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}
