import { Outlet } from "react-router-dom";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const AppLayout = () => {
  return (
    <div className="h-screen">
      <Sidebar />
      <div className="flex flex-col h-full pl-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto ">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
