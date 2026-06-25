import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";

function DashboardLayout() {
  return (
    <>
      <div className="flex flex-col h-screen">
        <Navbar/>
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-[15%] shrink-0 overflow-y-auto bg-base-100 shadow-sm h-screen p-4 flex flex-col gap-1">
            <Sidebar/>
          </aside>
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

export default DashboardLayout;
