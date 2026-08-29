import { useAuth } from "@/context/authcontext";
import {
  Home,
  Users,
  Wallet,
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
    icon: Wallet,
    path: "/loans",
  },
];

const quickActions = [
  {
    name: "Add Member",
    icon: UserPlus,
  },
  {
    name: "New Savings",
    icon: FilePlus,
  },
  {
    name: "Issue Loan",
    icon: CreditCard,
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
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="font-bold text-lg">HAMRO SAMUH</h1>
              <p className="text-xs text-green-100">
                Together we grow
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden hover:bg-white/10 rounded p-1"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition cursor-pointer ${location.pathname === item.path
                    ? "bg-emerald-500"
                    : "hover:bg-white/10"
                    }`}
                >
                  <Icon size={20} />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 border-t border-white/20 pt-6">
            <p className="text-xs text-green-200 mb-4 px-2">
              QUICK ACTIONS
            </p>

            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/10 text-sm transition"
                >
                  <Icon size={18} />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold">Admin</h3>
              <p className="text-xs text-green-200">Super Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-sm transition"
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