import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";

function Layout(){

  return (
    <div className="flex min-h-screen">

      <aside className="w-64 bg-gray-900 text-white">
        <Sidebar/>
      </aside>


      <main className="flex-1">
        <Outlet />
      </main>


    </div>
  );

}

export default Layout;