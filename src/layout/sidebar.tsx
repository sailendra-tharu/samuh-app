import { useAuth } from "@/context/authcontext";
import {
  Home,
  Users,
  Wallet,
  HandCoins,
  UserPlus,
  FilePlus,
  CreditCard,
  LogOut,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  {
    name: "Dashboard",
    icon: Home,
    path: "/dashboard",
  },
  {
    name: "Members",
    icon: Users,
    path: "/members",
  },
  {
    name: "Savings",
    icon: Wallet,
    path: "/savings",
  },
  {
    name: "Loans",
    icon: HandCoins,
    path: "/loans",
  },
];

const quickActions = [
  {
    name: "Add Member",
    icon: UserPlus,
    path: "/members",
  },
  {
    name: "New Savings",
    icon: FilePlus,
    path: "/savings",
  },
  {
    name: "Issue Loan",
    icon: CreditCard,
    path: "/loans",
  },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
    fixed top-0 left-0 z-50
    h-screen
    w-[85%] max-w-sm lg:w-64
    bg-[#006b45] text-white
    flex flex-col
    overflow-y-auto
    transform transition-transform duration-300
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0 lg:static
  `}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/15 ring-1 ring-white/10">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-sm font-bold tracking-[0.12em]">HAMRO SAMUH</h1>
              <p className="mt-0.5 text-[11px] text-emerald-100/60">Together we grow</p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-emerald-100 transition hover:bg-white/10 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition ${isActive
                    ? "bg-[#2bb673] font-semibold text-white shadow-[0_8px_20px_-12px_rgba(43,182,115,0.9)]"
                    : "text-emerald-50/75 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/45">Quick actions</p>

            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-emerald-50/60 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon size={17} />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white/15">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold">Admin</h3>
              <p className="text-xs text-emerald-100/55">Super Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-emerald-50/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
