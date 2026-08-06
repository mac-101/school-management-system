import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthPage from "./pages/auth";

import AppLayout from "./components/applayout";

import Dashboard from "./pages/Dashboard";
import StudentListPage from "./pages/StudentListPage";
import Staff from "./pages/StaffPage";
// import Timetable from "./pages/Timetable";
// import Schemes from "./pages/Schemes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected/Layout routes */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<StudentListPage />} />
          <Route path="/staff" element={<Staff />} />
          {/* <Route path="/timetable" element={<Timetable />} />
          <Route path="/schemes" element={<Schemes />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}