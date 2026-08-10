import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthPage from "./pages/auth";

import AppLayout from "./components/applayout";

import Dashboard from "./pages/Dashboard";
import StudentListPage from "./pages/StudentListPage";
import Staff from "./pages/StaffPage";
import StaffDetailPage from "./pages/StaffDetailPage";
import SchemeDetailPage from "./pages/SchemeDetailPage";
import SchemePage from "./pages/SchemePage";

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
          <Route path="/staff/:id" element={<StaffDetailPage />} />
          <Route path="/schemes" element={<SchemePage />} />
          <Route path="/schemes/:id" element={<SchemeDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}