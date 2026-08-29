import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import Sidebar from "./sidebar";


function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const section = pathSegments[0];
  const isDetailsPage = pathSegments.length > 1;
  const pageTitle = isDetailsPage && section === "savings"
    ? "Savings Details"
    : isDetailsPage && section === "members"
      ? "Member Details"
      : pathSegments
          .map((segment) =>
            segment.charAt(0).toUpperCase() + segment.slice(1)
          )
          .join(" ") || "Dashboard";

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 shrink-0 flex items-center px-4 border-b bg-white lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          <h1 className="ml-4 text-lg font-semibold">HAMRO SAMUH</h1>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between gap-4 shrink-0  bg-white px-6 py-4 shadow-md">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-slate-900">{pageTitle}</h1>
            <p className="text-slate-600">Manage member information with accuracy and transparency.</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50">
              <Bell size={20} />
              <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                3
              </span>
            </button>

            <div className="flex items-center gap-3 rounded-full  bg-white px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">Admin</p>
              </div>
                <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">

          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
