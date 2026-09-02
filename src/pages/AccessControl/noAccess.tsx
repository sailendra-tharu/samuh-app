import { ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/authcontext";

function NoAccess() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleReturnToLogin = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center py-8">
      <section className="w-full rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] sm:p-8">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldX className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-slate-900">No sections are available</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          An administrator has not enabled any sections for this member account.
          Please contact your group administrator.
        </p>
        <button
          type="button"
          onClick={() => void handleReturnToLogin()}
          className="mt-6 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Return to login
        </button>
      </section>
    </div>
  );
}

export default NoAccess;
