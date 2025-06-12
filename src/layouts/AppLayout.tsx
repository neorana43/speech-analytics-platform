import { Outlet, useLocation } from "react-router-dom";
import clsx from "clsx";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const AppLayout = () => {
  const location = useLocation();
  const isWelcomePage =
    location.pathname === "/" ||
    location.pathname === "/welcome" ||
    location.pathname === "/client-selection";

  return (
    <div
      className={clsx(
        "min-h-screen flex flex-col w-full",
        isWelcomePage && "welcome-bg",
      )}
    >
      <Topbar />
      <main className="flex-1 flex flex-col lg:px-6 px-5 lg:pb-6 pb-5">
        <Sidebar />
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
