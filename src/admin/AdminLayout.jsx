import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Building2, ExternalLink, FileText, Inbox, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import { useAuth } from "./AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/vendors", label: "Vendors", icon: Building2 },
  { to: "/admin/posts", label: "Blog", icon: FileText },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const sideClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
    isActive ? "bg-ivory-50/10 text-ivory-50" : "text-ivory-50/60 hover:bg-ivory-50/5 hover:text-ivory-50"
  }`;

const tabClass = ({ isActive }) =>
  `inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
    isActive ? "bg-ink-900 text-ivory-50" : "text-ink-600 hover:bg-ink-900/5 hover:text-ink-900"
  }`;

function Logo({ dark }) {
  return (
    <Link to="/admin" className="flex items-baseline gap-2">
      <span className={`font-serif text-xl font-medium ${dark ? "text-ivory-50" : "text-ink-900"}`}>
        Great<em className="font-light text-terra-400">Voyagers</em>
      </span>
      <span className="rounded-full bg-terra-500/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-terra-400">CRM</span>
    </Link>
  );
}

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const onLogout = async () => {
    setLeaving(true);
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-ivory-100 lg:pl-60">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-ink-950 px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo dark />
        </div>
        <nav aria-label="Admin" className="mt-10 flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={sideClass}>
              <Icon className="h-4 w-4" aria-hidden="true" /> {label}
            </NavLink>
          ))}
          <a href="/" target="_blank" rel="noreferrer" className={sideClass({ isActive: false })}>
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> View website
          </a>
        </nav>
        <div className="mt-auto border-t border-ivory-50/10 px-2 pt-5">
          <p className="truncate text-xs text-ivory-50/50" title={admin?.email}>
            {admin?.email}
          </p>
          <button
            type="button"
            onClick={onLogout}
            disabled={leaving}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ivory-50/80 transition-colors hover:text-ivory-50 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> {leaving ? "Logging out" : "Log out"}
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-ink-900/10 bg-ivory-50/95 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <button
            type="button"
            onClick={onLogout}
            disabled={leaving}
            className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 px-3 py-1.5 text-sm font-semibold text-ink-900 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> {leaving ? "…" : "Log out"}
          </button>
        </div>
        <nav aria-label="Admin mobile" className="flex gap-1 overflow-x-auto px-4 pb-2.5 sm:px-6 [scrollbar-width:none]">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={tabClass}>
              <Icon className="h-4 w-4" aria-hidden="true" /> {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-6 md:py-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}
