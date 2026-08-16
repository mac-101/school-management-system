import { formatCurrency } from "../utils/formatCurrency";
import { useNavigate } from "react-router-dom";

export default function StudentTableRow({ student, onEdit, onDelete }) {
  const balance = Number(student.student_fee) - Number(student.amount_paid);
  const navigate = useNavigate();

  return (
    <tr onClick={() => navigate(`/students/${student.id}`)} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50">
      <td className="py-2 px-4 whitespace-nowrap">
        {student.first_name} {student.last_name}
      </td>
      {/* <td className="py-2 px-4">{student.age}</td> */}
      <td className="py-2 px-4">{student.gender}</td>
      <td className="py-2 px-4">{student.level} {student.grade}</td>
      <td className="py-2 px-4">{student.student_id}</td>
      {/* <td className="py-2 px-4 whitespace-nowrap">
        {formatCurrency(student.student_fee)}
      </td>
      <td className="py-2 px-4 whitespace-nowrap">
        {formatCurrency(student.amount_paid)}
      </td> */}
      <td
        className={`py-2 px-4 whitespace-nowrap font-medium ${
          balance > 0 ? "text-red-600" : "text-emerald-600"
        }`}
      >
        {formatCurrency(balance)}
      </td>
      <td className="py-2 px-4 text-right whitespace-nowrap">
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
  );
}
