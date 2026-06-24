import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Bot,
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  ShieldAlert,
  Upload,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard",     icon: LayoutDashboard },
  { to: "/admin/upload",    label: "Upload Data",   icon: Upload           },
  { to: "/admin/documents", label: "Knowledge Base",icon: Database         },
  { to: "/admin/settings",  label: "Bot Settings",  icon: Settings         },
  { to: "/admin/chat-logs", label: "Chat Logs",     icon: MessageSquareText},
  { to: "/admin/danger-zone", label: "Danger Zone", icon: ShieldAlert      }
];

function Sidebar({ onClose }) {
  const { admin, logout } = useAuth();

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800">
        <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
            <Bot size={16} className="text-white" />
          </div>
          <span className="font-bold text-sm">AI Admin</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 md:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p className="text-sm font-medium truncate mt-0.5">{admin?.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex">
      {/* Desktop sidebar (fixed) */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <div className="fixed top-0 left-0 h-full w-64">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 sidebar-enter h-full">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm">AI Admin</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
