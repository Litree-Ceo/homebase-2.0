import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./src/components/Sidebar.jsx";
import { AuthProvider } from "./src/components/auth/AuthContext";
import ProtectedRoute from "./src/components/auth/ProtectedRoute";
import LoginPage from "./src/pages/LoginPage.jsx";
import RegisterPage from "./src/pages/RegisterPage.jsx";
import FeedPage from "./src/pages/FeedPage.jsx";
import PacksPage from "./src/pages/PacksPage.jsx";
import ProfilePage from "./src/pages/ProfilePage.jsx";
import ChatPage from "./src/pages/ChatPage.jsx";
import AgentPage from "./src/pages/AgentPage.jsx";
import MediaPage from "./src/pages/MediaPage.jsx";
import PaymentDemo from "./src/components/PaymentDemo.jsx";
import NeonDivider from "./src/components/NeonDivider.jsx";
// ...existing code...

// Dark mode toggle for dock
function DarkModeToggle({ className = "" }) {
  const [dark, setDark] = useState(
    () =>
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <button
      className={
        "px-4 py-2 rounded-glass bg-glass/70 dark:bg-glassDark/80 backdrop-blur-glass shadow-glass border border-white/10 text-lg font-bold text-accent hover:shadow-neon transition-glass " +
        className
      }
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle dark mode"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}

  return (
    <Router>
      <AuthProvider>
        <div
          className="relative min-h-screen bg-gradient-hero bg-cover bg-center dark:bg-gradient-hero2 text-white transition-colors duration-500"
          style={{ minHeight: "100vh" }}
        >
          <div className="absolute inset-0 bg-black/60 dark:bg-black/80 pointer-events-none z-0" />
          {/* Grainy overlay for cyberpunk drip */}
          <div className="grainy absolute inset-0 pointer-events-none z-10" />
          <div className="relative flex min-h-screen z-20">
            <Sidebar />
            <main className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-full max-w-4xl mx-auto glassmorphic-card rounded-glass shadow-glass bg-glass/80 dark:bg-glassDark/80 backdrop-blur-glass border border-white/10 p-8">
                <NeonDivider />
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                  <Route path="/agent" element={<ProtectedRoute><AgentPage /></ProtectedRoute>} />
                  <Route path="/media" element={<ProtectedRoute><MediaPage /></ProtectedRoute>} />
                  <Route path="/pay" element={<ProtectedRoute><PaymentDemo /></ProtectedRoute>} />
                  <Route path="/packs" element={<ProtectedRoute><PacksPage /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/feed" replace />} />
                </Routes>
              </div>
            </main>
          </div>
          {/* FloatingDock with dark mode toggle inside */}
          <div className="fixed bottom-0 left-0 w-full flex justify-center items-end z-50 pointer-events-none">
            <div className="pointer-events-auto flex items-end gap-4">
              <FloatingDock />
              <DarkModeToggle className="ml-2 mb-8" />
            </div>
          </div>
          {/* Global Floating Dock */}
          <FloatingDock userId={"mockUser"} />
        </div>
      </AuthProvider>
    </Router>
  );
}
