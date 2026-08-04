import { useAuth } from "@/context/authcontext";
import {
  Home,
  Users,
  Wallet,
  UserPlus,
  FilePlus,
  CreditCard,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
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


function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();


  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <aside className="w-64 min-h-screen bg-[#006b45] text-white flex flex-col">

      {/* Logo */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-white/20">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          👥
        </div>

        <div>
          <h1 className="font-bold text-lg">
            HAMRO SAMUH
          </h1>
          <p className="text-xs text-green-100">
            Savings & Loan Group
          </p>
        </div>
      </div>


      {/* Menu */}
      <nav className="flex-1 px-4 py-6">

        <div className="space-y-2">
          {menuItems.map((item,) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm ${location.pathname === item.path
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


          {
            quickActions.map((item) => {

              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  className="w-full flex items-center gap-4 px-4 py-3 
                  rounded-lg hover:bg-white/10 text-sm"
                >
                  <Icon size={18} />
                  {item.name}
                </button>
              )

            })
          }

        </div>

      </nav>


      {/* User Section */}
      <div className="p-4 border-t border-white/20">

        <div className="flex items-center gap-3 
        bg-white/10 rounded-lg p-3">

          <div className="w-10 h-10 bg-gray-300 rounded-full">
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold">
              Admin
            </h3>

            <p className="text-xs text-green-200">
              Super Admin
            </p>
          </div>

        </div>


        <button className="mt-3 w-full flex items-center gap-3 
        px-3 py-2 hover:bg-white/10 rounded-lg text-sm" onClick={handleLogout}>

          <LogOut size={18} />
          Logout

        </button>


      </div>

    </aside>
  );
}


export default Sidebar;