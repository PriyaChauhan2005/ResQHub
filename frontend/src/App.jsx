import { Routes, Route } from "react-router-dom";
import { useState, useRef } from "react";
import { useIncidents } from "./context/IncidentContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";

import MainLayout from "./components/layout/MainLayout";
import ResponderLayout from "./layouts/ResponderLayout";
import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./pages/victim/Dashboard";
import History from "./pages/victim/History";
import Map from "./pages/victim/Map";
import Resources from "./pages/victim/Resources";

import ResponderDashboard from "./pages/responder/ResponderDashboard";

import CommandCenter from "./pages/admin/CommandCenter";
import VictimRegistry from "./pages/admin/VictimRegistry";
import Responders from "./pages/admin/Responders";
import DeepAnalytics from "./pages/admin/DeepAnalytics";
import ZoneManagement from "./pages/admin/ZoneManagement";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { addIncident } = useIncidents();

  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  /* ================= TRIGGER SOS ================= */
  const triggerSOS = () => {
    const isOnline = navigator.onLine;

    const emergencyIncident = {
      id: Date.now(),
      title: "SOS Emergency Alert",
      description: "User triggered immediate SOS alert.",
      severity: "HIGH",
      location: null,
      status: "PENDING",
    };

    if (!isOnline) {
      const offlineIncidents =
        JSON.parse(localStorage.getItem("offlineIncidents")) || [];

      localStorage.setItem(
        "offlineIncidents",
        JSON.stringify([
          ...offlineIncidents,
          { ...emergencyIncident, synced: false },
        ])
      );

      alert("SOS saved offline. Will sync when network returns.");
      return;
    }

    addIncident(emergencyIncident);
    alert("SOS Alert Sent Successfully.");
  };

  /* ================= LONG PRESS LOGIC ================= */
  const startHold = () => {
    setHolding(true);
    let time = 0;

    timerRef.current = setInterval(() => {
      time += 100;
      setProgress((time / 3000) * 100);

      if (time >= 3000) {
        clearInterval(timerRef.current);
        setHolding(false);
        setProgress(0);
        triggerSOS();
      }
    }, 100);
  };

  const stopHold = () => {
    clearInterval(timerRef.current);
    setHolding(false);
    setProgress(0);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* VICTIM */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/victim/dashboard"
            element={
              <ProtectedRoute allowedRole="victim">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/victim/history" element={<History />} />
          <Route path="/victim/map" element={<Map />} />
          <Route path="/victim/resources" element={<Resources />} />
        </Route>

        {/* RESPONDER */}
        <Route
          path="/responder"
          element={
            <ProtectedRoute allowedRole="responder">
              <ResponderLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<ResponderDashboard />} />
        </Route>

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CommandCenter />} />
          <Route path="dashboard" element={<CommandCenter />} />
          <Route path="victim-registry" element={<VictimRegistry />} />
          <Route path="responders" element={<Responders />} />
          <Route path="deep-analytics" element={<DeepAnalytics />} />
          <Route path="zone-management" element={<ZoneManagement />} />
        </Route>

        <Route path="*" element={<Home />} />
      </Routes>

      {/* 🚨 GLOBAL LONG PRESS SOS BUTTON */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-center">
        <button
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
          className="relative bg-red-600 hover:bg-red-700 text-white 
          font-bold px-4 py-3 sm:px-6 sm:py-4 rounded-full shadow-2xl 
          shadow-red-600/40 transition transform hover:scale-110 overflow-hidden"
        >
          SOS

          {holding && (
            <div
              className="absolute bottom-0 left-0 h-1 bg-white"
              style={{ width: `${progress}%` }}
            />
          )}
        </button>

        <span className="text-xs text-red-300 mt-2 tracking-wide">
  Press & Hold to Send Emergency Alert
</span>

      </div>

    </div>
  );
}

export default App;