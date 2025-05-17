import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const AppLayout = () => {
  const location = useLocation();
  const showProjects = location.pathname.startsWith("/transcription");

  return (
    <div className="flex h-screen">
      {/* <Sidebar showProjects={showProjects} /> */}
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
