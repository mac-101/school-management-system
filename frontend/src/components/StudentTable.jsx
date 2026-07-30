import StudentTableRow from "./StudentTableRow";

export default function StudentTable({ students, onEdit, onDelete }) {
  if (students.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg py-16 text-center text-sm text-slate-400">
        No students match this filter.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-200">
            <th className="py-3 px-4 font-medium">Name</th>
            <th className="py-3 px-4 font-medium">Age</th>
            <th className="py-3 px-4 font-medium">Gender</th>
            <th className="py-3 px-4 font-medium">Level</th>
            <th className="py-3 px-4 font-medium">Grade</th>
            <th className="py-3 px-4 font-medium">Student Fee</th>
            <th className="py-3 px-4 font-medium">Amount Paid</th>
            <th className="py-3 px-4 font-medium">Balance</th>
            <th className="py-3 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <StudentTableRow
              key={student.id}
              student={student}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
