import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isFirstTimeLogin } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  // If first time login, only allow access to change-password page
  if (isFirstTimeLogin) {
    if (location.pathname === "/change-password") {
      return <>{children}</>;
    }

    return (
      <Navigate replace state={{ from: location }} to="/change-password" />
    );
  }

  // If authenticated and not first time login, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
