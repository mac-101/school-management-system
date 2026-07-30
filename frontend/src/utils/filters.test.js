import test from "node:test";
import assert from "node:assert/strict";
import { filterStudents } from "./filters.js";

test("filterStudents matches a search term across student name and class details", () => {
  const students = [
    {
      id: 1,
      first_name: "Ada",
      last_name: "Lovelace",
      level: "Primary",
      grade: 1,
      gender: "Female",
      student_fee: "100",
      amount_paid: "0",
    },
    {
      id: 2,
      first_name: "John",
      last_name: "Doe",
      level: "JSS",
      grade: 2,
      gender: "Male",
      student_fee: "200",
      amount_paid: "100",
    },
  ];

  const result = filterStudents(students, "all", "doe");

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 2);
});
