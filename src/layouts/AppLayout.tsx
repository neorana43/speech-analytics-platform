import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Sidebar from "@/components/Sidebar";

export default function AppLayout() {
  const location = useLocation();
  const showProjects = location.pathname.startsWith("/transcription");

  return (
    <div className="app-layout">
      <Sidebar showProjects={showProjects} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
