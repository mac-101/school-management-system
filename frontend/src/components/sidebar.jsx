import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Students", path: "/students" },
  { label: "Staff", path: "/staff" },
  { label: "Timetable", path: "/timetable" },
  { label: "Schemes", path: "/schemes" },
];

export default function Sidebar() {
  return (
    <aside className="relative z-30 flex h-screen w-56 shrink-0 flex-col justify-between bg-[#0A2472] py-6 text-white">
      <div>
        <div className="px-6 mb-8 text-lg font-semibold">
          Logo
        </div>

        <nav className="flex flex-col">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-left px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-white/10 border-r-4 border-white font-medium"
                    : "text-white/80 hover:bg-white/5"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <button className="text-left px-6 py-3 text-sm text-white/80 hover:bg-white/5">
        Logout
      </button>
    </aside>
  );
}