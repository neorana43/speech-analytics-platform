import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import LoginPage from "@/pages/Login";
import WelcomePage from "@/pages/Welcome";
import TranscriptionPage from "@/pages/Transcription";
import PromptDesignerPage from "@/pages/PromptDesigner";
const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      {isAuthenticated ? (
        <Route element={<AppLayout />}>
          <Route element={<Navigate to="/welcome" />} path="/" />
          <Route element={<WelcomePage />} path="/welcome" />
          <Route element={<TranscriptionPage />} path="/transcription" />
          <Route element={<PromptDesignerPage />} path="/prompt-designer" />
        </Route>
      ) : (
        <Route element={<Navigate to="/login" />} path="*" />
      )}
    </Routes>
  );
};

export default AppRouter;
