import { Link, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Upload, Settings, Database, ShieldAlert, MessageSquareText, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/upload", label: "Upload Data", icon: Upload },
  { to: "/admin/documents", label: "Knowledge Base", icon: Database },
  { to: "/admin/settings", label: "Bot Settings", icon: Settings },
  { to: "/admin/chat-logs", label: "Chat Logs", icon: MessageSquareText },
  { to: "/admin/danger-zone", label: "Danger Zone", icon: ShieldAlert }
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex">
      <aside className="w-72 hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <Link to="/" className="text-xl font-bold mb-6">
          AI Admin
        </Link>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl ${
                    isActive ? "bg-indigo-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={18} /> {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="text-sm text-slate-500 mb-3">Logged in as {admin?.email}</div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-200 dark:bg-slate-800 py-2"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}