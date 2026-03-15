import { useAuth } from "./hooks/useAuth";
import { Routes, Route, Navigate, Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Termux from "./pages/Termux";
import { UserProfile } from "./components/UserProfile";
import Loader from "./components/Loader";

import Welcome from "./pages/Welcome";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Dashboard>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/termux" element={<Termux />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Dashboard>
  );
}

export default App;
