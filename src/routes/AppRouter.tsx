import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import Login from "@/pages/Login";
import Welcome from "@/pages/Welcome";
import PromptDesigner from "@/pages/PromptDesigner";
import Transcription from "@/pages/Transcription";
import TranscriptionDetails from "@/pages/Transcription/TranscriptionDetails";
import TranscriptionTraining from "@/pages/Transcription/TranscriptionTraining"; // ✅ import

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public route */}
      <Route element={<Login />} path="/login" />

      {/* Protected routes */}
      {isAuthenticated ? (
        <Route element={<AppLayout />}>
          <Route element={<Navigate to="/welcome" />} path="/" />
          <Route element={<Welcome />} path="/welcome" />
          <Route element={<PromptDesigner />} path="/prompt-designer" />
          <Route element={<Transcription />} path="/transcription" />
          <Route element={<TranscriptionDetails />} path="/transcription/:id" />
          <Route
            element={<TranscriptionTraining />}
            path="/transcription/:id/training"
          />
        </Route>
      ) : (
        <Route element={<Navigate to="/login" />} path="*" />
      )}
    </Routes>
  );
};

export default AppRouter;
