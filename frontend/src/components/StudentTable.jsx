import { formatCurrency } from "../utils/formatCurrency";

export default function StudentTable({ students, onEdit, onDelete }) {
  if (students.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-400">
        No students in this class.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-200">
            <th className="py-2 pr-4 font-medium">Full Name</th>
            <th className="py-2 pr-4 font-medium">Age</th>
            <th className="py-2 pr-4 font-medium">Gender</th>
            <th className="py-2 pr-4 font-medium">Level</th>
            <th className="py-2 pr-4 font-medium">Grade</th>
            <th className="py-2 pr-4 font-medium">Student Fee</th>
            <th className="py-2 pr-4 font-medium">Amount Paid</th>
            <th className="py-2 pr-4 font-medium">Balance</th>
            <th className="py-2 pr-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.id}
              className="border-b border-slate-100 text-slate-700 hover:bg-slate-50"
            >
              <td className="py-2 pr-4 whitespace-nowrap">
                {student.first_name} {student.last_name}
              </td>
              <td className="py-2 pr-4">{student.age}</td>
              <td className="py-2 pr-4">{student.gender}</td>
              <td className="py-2 pr-4">{student.level}</td>
              <td className="py-2 pr-4">{student.grade}</td>
              <td className="py-2 pr-4 whitespace-nowrap">
                {formatCurrency(student.student_fee)}
              </td>
              <td className="py-2 pr-4 whitespace-nowrap">
                {formatCurrency(student.amount_paid)}
              </td>
              <td
                className={`py-2 pr-4 whitespace-nowrap font-medium ${
                  Number(student.fee_balance) > 0
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                {formatCurrency(student.fee_balance)}
              </td>
              <td className="py-2 pr-4 text-right whitespace-nowrap">
                <button
                  onClick={() => onEdit?.(student)}
                  className="text-[#0A2472] hover:underline mr-3 text-xs font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete?.(student)}
                  className="text-red-600 hover:underline text-xs font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
