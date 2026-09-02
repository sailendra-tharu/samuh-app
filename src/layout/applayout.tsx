import { useEffect, useRef, useState, type RefObject } from "react";
import { Outlet } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./sidebar";
import { useAuth } from "@/context/authcontext";


function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const mobileProfileMenuRef = useRef<HTMLDivElement>(null);
  const desktopProfileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        !mobileProfileMenuRef.current?.contains(event.target as Node) &&
        !desktopProfileMenuRef.current?.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const section = pathSegments[0];
  const isDetailsPage = pathSegments.length > 1;
  const pageTitle = section === "profit-loss"
    ? "Profit & Loss"
    : section === "access-control"
      ? "Settings"
    : isDetailsPage && section === "savings"
      ? "Savings Details"
    : isDetailsPage && section === "loans"
      ? "Loan Details"
      : isDetailsPage && section === "members"
        ? "Member Details"
        : pathSegments
            .map((segment) =>
              segment.charAt(0).toUpperCase() + segment.slice(1)
            )
            .join(" ") || "Dashboard";
  const pageDescription = section === "dashboard"
    ? "Manage and monitor your group’s financial activity with ease."
    : section === "members"
      ? "Keep your member directory accurate, organized, and up to date."
      : section === "savings"
        ? "Track contributions and keep your group’s savings moving forward."
        : section === "loans"
          ? "Manage lending, repayments, and outstanding balances in one place."
          : section === "profit-loss"
            ? "Enter and review monthly profit and loss details in one place."
          : section === "investment"
            ? "Track group investments, current value, and returns in one place."
          : section === "access-control"
            ? "Manage member read and write access."
          : "Review the latest details for your group.";
  const userInitial = user?.email?.charAt(0).toUpperCase() || "A";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen w-full min-w-0 bg-[#f5f8f7]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-3 sm:px-4 lg:hidden">
          <div className="flex min-w-0 items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

            <div className="ml-2 min-w-0 sm:ml-3">
              <h1 className="truncate text-base font-semibold tracking-[-0.02em] text-slate-900">
                {pageTitle}
              </h1>
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                {pageDescription}
              </p>
            </div>
          </div>

          <ProfileMenu
            menuRef={mobileProfileMenuRef}
            compact
            email={user?.email}
            isAdmin={isAdmin}
            isOpen={profileMenuOpen}
            onClose={() => setProfileMenuOpen(false)}
            onLogout={() => void handleLogout()}
            onToggle={() => setProfileMenuOpen((open) => !open)}
            onSettings={() => navigate("/access-control")}
            role={role}
            userInitial={userInitial}
          />
        </header>

        {/* Desktop Header */}
        <header className="sticky top-0 z-30 hidden shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-8 py-5 lg:flex">
          <div className="min-w-0 space-y-1">
            <h1 className="truncate text-2xl font-semibold tracking-[-0.03em] text-slate-900">{pageTitle}</h1>
            <p className="truncate text-sm text-slate-500">{pageDescription}</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#e66b54] text-[10px] font-semibold text-white">
                3
              </span>
            </button>

            <ProfileMenu
              menuRef={desktopProfileMenuRef}
              email={user?.email}
              isAdmin={isAdmin}
              isOpen={profileMenuOpen}
              onClose={() => setProfileMenuOpen(false)}
              onLogout={() => void handleLogout()}
              onToggle={() => setProfileMenuOpen((open) => !open)}
              onSettings={() => navigate("/access-control")}
              role={role}
              userInitial={userInitial}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="min-w-0 overflow-x-hidden p-3 pb-8 sm:p-4 sm:pb-10 lg:p-8">

          <Outlet />
        </main>
      </div>
    </div>
  );
}

type ProfileMenuProps = {
  menuRef: RefObject<HTMLDivElement | null>;
  compact?: boolean;
  email?: string;
  isAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSettings: () => void;
  onToggle: () => void;
  role: "admin" | "member";
  userInitial: string;
};

function ProfileMenu({
  menuRef,
  compact = false,
  email,
  isAdmin,
  isOpen,
  onClose,
  onLogout,
  onSettings,
  onToggle,
  role,
  userInitial,
}: ProfileMenuProps) {
  return (
    <div
      ref={menuRef}
      className={compact ? "relative" : "relative border-l border-slate-200 pl-4"}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open account menu"
        className={compact
          ? "flex items-center gap-1.5 rounded-xl p-1.5 text-left transition hover:bg-slate-50"
          : "flex items-center gap-3 rounded-xl p-1.5 text-left transition hover:bg-slate-50"}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dff4e8] text-sm font-bold text-[#087b55] sm:h-10 sm:w-10">
          {userInitial}
        </div>
        {!compact && (
          <div className="hidden min-w-0 sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {role === "admin" ? "Admin" : "Member"}
            </p>
            <p className="max-w-32 truncate text-xs text-slate-500">
              {email || "Account"}
            </p>
          </div>
        )}
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_35px_-18px_rgba(15,23,42,0.45)]">
          <div className="border-b border-slate-100 px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Signed in as
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
              {role === "admin" ? "Admin" : "Member"}
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                onSettings();
                onClose();
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              Settings
            </button>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default Layout;
