
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { useMemo, useEffect, useState } from "react";
import useNetworkStatus from "../hooks/useNetworkStatus";
import { apiRequest } from "../utils/api";


/* ================= COUNT UP HOOK ================= */
function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);

    const interval = setInterval(() => {
      start += increment;

      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [target, duration]);

  return count;
}

export default function Home() {
  const isOnline = useNetworkStatus();
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const safeIncidents = useMemo(
    () => (Array.isArray(incidents) ? incidents : []),
    [incidents]
  );
  const safeUsers = useMemo(
    () => (Array.isArray(users) ? users : []),
    [users]
  );

  /* ================= OPTIMIZED STATS ================= */

  const {
    activeIncidents,
    respondersOnline,
    criticalAlerts,
    resolutionRate,
  } = useMemo(() => {
    const total = safeIncidents.length;

    const resolved = safeIncidents.filter(
      (i) => i.status === "RESOLVED"
    ).length;

    const active = safeIncidents.filter(
      (i) =>
        i.status === "PENDING" ||
        i.status === "ASSIGNED" ||
        i.status === "IN_PROGRESS"
    ).length;

    const critical = safeIncidents.filter(
      (i) =>
        i.severity === "HIGH" &&
        i.status !== "RESOLVED"
    ).length;

    const onlineResponders = safeUsers.filter(
      (u) => u.role === "responder"
    ).length;

    return {
      activeIncidents: active,
      respondersOnline: onlineResponders,
      criticalAlerts: critical,
      resolutionRate:
        total === 0
          ? 0
          : Math.round((resolved / total) * 100),
    };
  }, [safeIncidents, safeUsers]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [incidentsPayload, usersPayload] = await Promise.all([
          apiRequest("/incidents", { method: "GET" }),
          apiRequest("/users", { method: "GET" }),
        ]);

        setIncidents(Array.isArray(incidentsPayload?.data) ? incidentsPayload.data : []);
        setUsers(Array.isArray(usersPayload?.data) ? usersPayload.data : []);
      } catch {
        setIncidents([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  /* ================= ANIMATED VALUES ================= */

  const animatedActive = useCountUp(activeIncidents);
  const animatedResponders = useCountUp(respondersOnline);
  const animatedCritical = useCountUp(criticalAlerts);
  const animatedRate = useCountUp(resolutionRate);

  return (
  <div className="bg-gradient-to-br from-[#0b1420] to-[#0e1c2f] text-slate-100 min-h-screen">

{/* 🚨 EMERGENCY BROADCAST TICKER */}
<section className="bg-red-800 text-white py-4 border-b border-red-900 overflow-hidden">

  <div className="relative w-full overflow-hidden">

    <div className="flex animate-marquee whitespace-nowrap items-center text-sm md:text-base tracking-wide">

      {/* Copy 1 */}
      <div className="flex gap-16 pr-16 items-center">

        <span className="font-semibold uppercase">
          ⚠ National Critical Response Mode Active
        </span>

        <span>Emergency Access Available Without Internet</span>

        <a href="tel:112" className="font-semibold hover:underline">
          Unified Emergency: 112
        </a>

        <a href="tel:100" className="hover:underline">
          Police: 100
        </a>

        <a href="tel:101" className="hover:underline">
          Fire Services: 101
        </a>

        <a href="tel:108" className="hover:underline">
          Ambulance / Medical: 108
        </a>

        <a href="tel:181" className="hover:underline">
          Women Helpline: 181
        </a>

        <a href="tel:1078" className="hover:underline">
          National Disaster Management: 1078
        </a>

        <a href="tel:1070" className="hover:underline">
          State Emergency Operations: 1070
        </a>

        <a href="tel:1098" className="hover:underline">
          Child Helpline: 1098
        </a>

        <span>Offline Incident Capture & Sync Enabled</span>

      </div>

      {/* Copy 2 */}
      <div className="flex gap-16 pr-16 items-center">

        <span className="font-semibold uppercase">
          ⚠ National Critical Response Mode Active
        </span>

        <span>Emergency Access Available Without Internet</span>

        <a href="tel:112" className="font-semibold hover:underline">
          Unified Emergency: 112
        </a>

        <a href="tel:100" className="hover:underline">
          Police: 100
        </a>

        <a href="tel:101" className="hover:underline">
          Fire Services: 101
        </a>

        <a href="tel:108" className="hover:underline">
          Ambulance / Medical: 108
        </a>

        <a href="tel:181" className="hover:underline">
          Women Helpline: 181
        </a>

        <a href="tel:1078" className="hover:underline">
          National Disaster Management: 1078
        </a>

        <a href="tel:1070" className="hover:underline">
          State Emergency Operations: 1070
        </a>

        <a href="tel:1098" className="hover:underline">
          Child Helpline: 1098
        </a>

        <span>Offline Incident Capture & Sync Enabled</span>

      </div>

    </div>

  </div>

</section>


      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b1420]/80 border-b border-blue-500/10">
  <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

    {/* LEFT: Logo + LIVE */}
    <div className="flex items-center gap-4">

      <div className="flex items-center gap-2">
        <img
          src={Logo}
          alt="ResQHub Logo"
          className="w-9 h-9 object-contain"
        />
        <span className="text-xl font-semibold tracking-tight">
          ResQ<span className="text-blue-400">Hub</span>
        </span>
      </div>

      {/* LIVE Indicator */}
      <div className="hidden md:flex items-center gap-2 ml-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
        </span>
        <span className="text-xs text-red-400 font-semibold tracking-wider">
          LIVE
        </span>
      </div>

    </div>

    {/* CENTER NAV */}
    <nav className="hidden md:flex gap-8 text-sm text-slate-400 font-medium">
      <a href="#platform" className="hover:text-white transition">
        Platform
      </a>
      <a href="#workflow" className="hover:text-white transition">
        Workflow
      </a>
      <a href="#roles" className="hover:text-white transition">
        Roles
      </a>
    </nav>

    {/* RIGHT SIDE */}
    <div className="flex items-center gap-4">

      <Link
        to="/login"
        className="text-sm text-slate-400 hover:text-white transition"
      >
        Login
      </Link>

      <Link
        to="/victim/dashboard"
        className="bg-red-600 hover:bg-red-700 
        px-5 py-2 rounded-xl text-sm font-semibold 
        shadow-lg shadow-red-600/30 
        transition transform hover:scale-105"
      >
        🚨 Report Emergency
      </Link>

    </div>

  </div>
</header>

      {/* ================= HERO ================= */}
<section className="relative overflow-hidden max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center">

  {/* Subtle Animated Radar Background */}
  <div className="absolute right-[-200px] top-[-150px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
  <div className="absolute left-[-200px] bottom-[-200px] w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-3xl"></div>

  {/* LEFT CONTENT */}
  <div className="relative z-10">

    <span className="text-xs bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full font-semibold tracking-wide">
      LIVE INCIDENT RESPONSE SYSTEM
    </span>

    <h1 className="text-3xl md:text-5xl font-bold mt-6 leading-tight">
      Unified Emergency <br />
      <span className="text-blue-400 bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
        Coordination Platform
      </span>
    </h1>

    <p className="text-slate-400 mt-6 text-lg max-w-xl leading-relaxed">
      ResQHub connects victims, responders, and command centers 
      in a single real-time response ecosystem — ensuring faster 
      reporting, smarter dispatch, and transparent coordination.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 mt-10">

      <Link
        to="/admin/dashboard"
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold 
        shadow-lg shadow-blue-600/30 
        transition transform hover:scale-105"
      >
        Open Command Center
      </Link>

      <Link
        to="/responder/dashboard"
        className="bg-[#162435] hover:bg-[#1e2f44] px-6 py-3 rounded-xl font-semibold 
        transition transform hover:scale-105 border border-blue-500/10"
      >
        Responder Panel
      </Link>

    </div>

  </div>

  {/* RIGHT HERO VISUAL */}
<div className="relative z-10">

  {/* Glowing Border */}
  <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-blue-500/40 via-transparent to-blue-400/40">

    <div className="bg-[#121f32] rounded-3xl p-6 shadow-2xl shadow-blue-500/10 overflow-hidden relative">

      {/* Floating LIVE Badge */}
      <div className="absolute top-4 right-4 bg-[#0e1a2b] border border-green-500/30 px-3 py-1 rounded-lg text-xs text-green-400 flex items-center gap-2 z-20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
        </span>
        Live Monitoring
      </div>

      {/* Radar + Map Container */}
      <div className="relative h-80 rounded-2xl bg-[#0e1a2b] flex items-center justify-center overflow-hidden">

        {/* Rotating World */}
        <div className="absolute w-96 h-96 opacity-10 animate-spin-slow">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
            alt="world map"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Radar Sweep */}
        <svg className="absolute w-72 h-72">
          <defs>
            <linearGradient id="radarGradient">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          <circle
            cx="144"
            cy="144"
            r="120"
            stroke="#1e40af"
            strokeWidth="1"
            fill="none"
          />

          <path
            d="M144 144 L144 24 A120 120 0 0 1 264 144 Z"
            fill="url(#radarGradient)"
            className="origin-center animate-spin"
          />
        </svg>

        {/* Dispatch Line Animation */}
        <div className="absolute w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red] animate-pulse top-1/3 left-1/3"></div>

        <svg className="absolute w-full h-full">
          <line
            x1="30%"
            y1="30%"
            x2="70%"
            y2="60%"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="6"
            className="animate-dash"
          />
        </svg>

        <div className="text-slate-400 text-sm tracking-wide z-10">
          Global Response Grid Active
        </div>

        </div>

      </div>
    </div>

  </div>

</section>


      {/* ================= LIVE STATUS STRIP ================= */}
      <section className="bg-[#0f1b2a] border-y border-blue-500/10 py-6">
  <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm">

    <div className="hover:scale-105 transition">
      <p className="text-slate-400">Active Incidents</p>
      <p className="text-blue-400 text-xl font-bold mt-1">
  {loading ? "Loading..." : animatedActive}
</p>
    </div>

    <div className="hover:scale-105 transition">
      <p className="text-slate-400">Responders Online</p>
      <p className="text-green-400 text-xl font-bold mt-1">
  {loading ? "Loading..." : animatedResponders}
</p>
    </div>

    <div className="hover:scale-105 transition">
      <p className="text-slate-400">High Priority Alerts</p>
      <p className="text-red-400 text-xl font-bold mt-1">
  {loading ? "Loading..." : animatedCritical}</p>
    </div>

    <div className="hover:scale-105 transition">
      <p className="text-slate-400">Resolution Rate</p>
      <p className="text-blue-400 text-xl font-bold mt-1">
  {loading ? "Loading..." : `${animatedRate}%`}
</p>
    </div>

  </div>
</section>

      

      {/* ================= HOW IT WORKS ================= */}
      <section id="workflow" className="bg-[#0f1b2a] py-16 md:py-24 border-y border-blue-500/10">

        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold">
            From Emergency to Resolution
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">

            {[
              "Victim Reports Incident",
              "System Logs & Classifies",
              "Responder Assigned",
              "Command Monitors & Resolves",
            ].map((step, index) => (
              <div key={index}>
                <div className="w-12 h-12 rounded-full border-2 border-blue-500 flex items-center justify-center mx-auto font-bold text-blue-400">
                  {index + 1}
                </div>
                <p className="mt-4 text-sm text-slate-300">{step}</p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ================= ROLE SECTION ================= */}
      <section id="roles" className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">

        <h2 className="text-3xl font-bold text-center mb-16">
          Built for Every Role
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Victim */}
          <div className="bg-[#121f32] border border-blue-500/10 p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-red-400">Victim Portal</h3>
            <p className="text-slate-400 text-sm">
              Quickly report emergencies with location detection,
              urgency tagging, and real-time status tracking.
            </p>
          </div>

          {/* Responder */}
          <div className="bg-[#121f32] border border-blue-500/10 p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-green-400">Responder Dashboard</h3>
            <p className="text-slate-400 text-sm">
              View incoming incidents, accept cases, track routing,
              and monitor live operational maps.
            </p>
          </div>

          {/* Admin */}
          <div className="bg-[#121f32] border border-blue-500/10 p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Command Center</h3>
            <p className="text-slate-400 text-sm">
              Monitor KPIs, analyze incident distribution,
              manage zones, and oversee dispatch pipelines.
            </p>
          </div>

        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-center shadow-2xl shadow-blue-600/20">

          <h2 className="text-3xl font-bold">
            Ready to Transform Emergency Response?
          </h2>

          <p className="mt-4 text-blue-100">
            Deploy ResQHub and enable structured, transparent,
            and faster disaster management workflows.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-8">
            <Link
              to="/admin/dashboard"
              className="bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold"
            >
              Access Platform
            </Link>

            <Link
              to="/login"
              className="border border-white px-6 py-3 rounded-xl font-semibold"
            >
              Get Started
            </Link>
          </div>

        </div>
      </section>

       {/* ================= FOOTER ================= */}
      
      <div className="mt-24 h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>

     <footer className="bg-[#0b1420] border-t border-red-900/40 pt-16 pb-10 text-slate-300">

  <div className="max-w-7xl mx-auto px-4 md:px-8 grid sm:grid-cols-2 md:grid-cols-4 gap-12">

    {/* 1️⃣ Brand */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">
        ResQHub
      </h3>

      <p className="text-sm text-slate-400 leading-relaxed">
        An emergency coordination platform designed to
        demonstrate offline-first reporting, incident tracking,
        and command-center monitoring during disaster scenarios.
      </p>
    </div>

    {/* 2️⃣ Platform */}
    <div>
      <h4 className="text-sm font-semibold text-white uppercase mb-4 tracking-wide">
        Platform
      </h4>

      <ul className="space-y-3 text-sm">
        <li>Victim Reporting Dashboard</li>
        <li>Responder Operations Panel</li>
        <li>Admin Command Center</li>
        <li>Zone & Heatmap Analytics</li>
        <li>Offline Sync Architecture</li>
      </ul>
    </div>

    {/* 3️⃣ Emergency Resources */}
    <div>
      <h4 className="text-sm font-semibold text-white uppercase mb-4 tracking-wide">
        National Emergency Resources (India)
      </h4>

      <ul className="space-y-3 text-sm">
        <li>
  <a href="tel:112" className="hover:underline font-medium text-red-400">
    Unified Emergency – 112
  </a>
</li>

        <li><a href="tel:108" className="hover:underline">Medical Services – 108</a></li>
        <li><a href="tel:100" className="hover:underline">Police – 100</a></li>
        <li><a href="tel:101" className="hover:underline">Fire – 101</a></li>
        <li><a href="tel:181" className="hover:underline">Women Helpline – 181</a></li>
      </ul>
    </div>

    {/* 4️⃣ Support */}
    <div>
      <h4 className="text-sm font-semibold text-white uppercase mb-4 tracking-wide">
        Support
      </h4>

      <ul className="space-y-3 text-sm text-slate-400">
        <li>Email: resqhub.demo@gmail.com</li>
        <li>Technical Feedback</li>
        <li>Report Platform Issue</li>
      </ul>
    </div>

  </div>

  {/* Bottom Bar */}
<div className="border-t border-red-900/40 mt-12 pt-6 text-center text-xs text-slate-500">

  <div className="flex flex-col md:flex-row items-center justify-center gap-4">

    <span>
      © 2026 ResQHub | Prototype Demonstration Project
    </span>

    {/* 🔵 Network Status */}
    <span
      className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide ${
        isOnline
          ? "bg-green-600/20 text-green-400 border border-green-500/30"
          : "bg-red-600/20 text-red-400 border border-red-500/30 animate-[softPulse_2s_infinite]"
      }`}
    >
      {isOnline
        ? "System Online"
        : "Network Disconnected – Fallback Mode Active"}
    </span>

  </div>

  <div className="mt-3 max-w-3xl mx-auto text-[11px] leading-relaxed text-slate-600">
    This platform is a student-developed prototype and is not affiliated with any government authority.
    In real emergencies, please contact official national emergency services directly.
  </div>

</div>


</footer>


    </div>
  );
}