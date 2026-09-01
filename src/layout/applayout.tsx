import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import Sidebar from "./sidebar";
import { useAuth } from "@/context/authcontext";


function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const section = pathSegments[0];
  const isDetailsPage = pathSegments.length > 1;
  const pageTitle = section === "profit-loss"
    ? "Profit & Loss"
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
          : "Review the latest details for your group.";
  const adminInitial = user?.email?.charAt(0).toUpperCase() || "A";

  return (
    <div className="flex min-h-screen w-full min-w-0 bg-[#f5f8f7]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-slate-200/80 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <h1 className="ml-3 text-sm font-bold tracking-[0.12em] text-[#103f34]">HAMRO SAMUH</h1>
        </header>

        {/* Desktop Header */}
        <header className="sticky top-0 z-30 hidden shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-8 py-5 lg:flex">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">{pageTitle}</h1>
            <p className="text-sm text-slate-500">{pageDescription}</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#e66b54] text-[10px] font-semibold text-white">
                3
              </span>
            </button>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dff4e8] text-sm font-bold text-[#087b55]">
                {adminInitial}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">Admin</p>
                <p className="max-w-32 truncate text-xs text-slate-500">{user?.email || "Group administrator"}</p>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-w-0 overflow-x-hidden p-4 lg:p-8">

          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
