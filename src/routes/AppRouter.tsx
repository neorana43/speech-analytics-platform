import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import Login from "@/pages/Login";
import ClientSelection from "@/pages/ClientSelection";
import Welcome from "@/pages/Welcome";
import PromptDesigner from "@/pages/PromptDesigner";
import TranscriptionDetails from "@/pages/Transcription/TranscriptionDetails";
import TranscriptionTraining from "@/pages/Transcription/TranscriptionTraining";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ChangePassword from "@/pages/ChangePassword";
import Users from "@/pages/Users";
import AddUser from "@/pages/Users/AddUser";
import EditUser from "@/pages/Users/EditUser";
import Clients from "@/pages/Clients";
import AddClient from "@/pages/Clients/AddClient";
import EditClient from "@/pages/Clients/EditClient";
import Settings from "@/pages/Settings";
import ProtectedRoute from "@/components/ProtectedRoute";

const AppRouter = () => {
  const { isAuthenticated, isFirstTimeLogin } = useAuth();

  // If not authenticated, show public routes
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route element={<Login />} path="/login" />
        <Route element={<ForgotPassword />} path="/forgot-password" />
        <Route element={<ResetPassword />} path="/reset-password" />
        <Route element={<ChangePassword />} path="/change-password" />
        <Route element={<Navigate replace to="/login" />} path="*" />
      </Routes>
    );
  }

  // If authenticated and not first time login, show protected routes
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route element={<Navigate to="/welcome" />} path="/" />
        <Route element={<ClientSelection />} path="/client-selection" />
        <Route element={<Welcome />} path="/welcome" />
        <Route element={<PromptDesigner />} path="/prompt-designer" />
        <Route element={<TranscriptionDetails />} path="/transcription/:id" />
        <Route
          element={<TranscriptionTraining />}
          path="/transcription/:id/training"
        />
        <Route element={<Users />} path="/users" />
        <Route element={<AddUser />} path="/users/add" />
        <Route element={<EditUser />} path="/users/edit/:id" />
        <Route element={<Clients />} path="/clients" />
        <Route element={<AddClient />} path="/clients/add" />
        <Route element={<EditClient />} path="/clients/edit/:id" />
        <Route element={<Settings />} path="/settings" />
      </Route>
    </Routes>
  );
};

export default AppRouter;
