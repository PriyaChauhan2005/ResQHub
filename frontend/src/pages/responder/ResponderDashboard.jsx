import { useState, useEffect, useRef } from "react";
import BottomStats from "../../components/responder/BottomStats";
import AlertBanner from "../../components/responder/AlertBanner";
import MapView from "../../components/responder/MapView";
import LayerToggle from "../../components/responder/LayerToggle";
import RoutingCard from "../../components/responder/RoutingCard";
import { useIncidents } from "../../context/IncidentContext";

const TABS = ["ALL", "PENDING", "ASSIGNED", "RESOLVED"];

const severityBorder = (severity) => {
  if (severity === "HIGH") return "border-red-500/25 hover:border-red-500/50";
  if (severity === "MEDIUM") return "border-orange-400/20 hover:border-orange-400/40";
  return "border-slate-500/10 hover:border-slate-500/25";
};

const severityBadge = (severity) => {
  if (severity === "HIGH") return "text-red-400 bg-red-500/10 border-red-500/30";
  if (severity === "MEDIUM") return "text-orange-400 bg-orange-500/10 border-orange-500/20";
  return "text-slate-400 bg-slate-500/10 border-slate-500/20";
};

const statusBadge = (status) => {
  if (status === "PENDING") return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
  if (status === "ASSIGNED") return "text-blue-400 bg-blue-500/10 border-blue-500/20";
  if (status === "RESOLVED") return "text-green-400 bg-green-500/10 border-green-500/20";
  return "text-slate-400 bg-slate-500/10 border-slate-500/20";
};

export default function ResponderDashboard() {
  const { incidents, updateStatus } = useIncidents();

  const [activeTab, setActiveTab] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [highlightedId, setHighlightedId] = useState(null);
  const [lastPlayedId, setLastPlayedId] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const audioRef = useRef(null);
  const currentResponder = JSON.parse(localStorage.getItem("currentUser"));

  const counts = {
    ALL: incidents.filter(
      (i) => i.assignedTo === currentResponder?.name || i.status === "PENDING"
    ).length,
    PENDING: incidents.filter((i) => i.status === "PENDING").length,
    ASSIGNED: incidents.filter(
      (i) => i.status === "ASSIGNED" && i.assignedTo === currentResponder?.name
    ).length,
    RESOLVED: incidents.filter(
      (i) => i.status === "RESOLVED" && i.assignedTo === currentResponder?.name
    ).length,
  };

  const tabFiltered = incidents.filter((incident) => {
    if (activeTab === "PENDING") return incident.status === "PENDING";
    if (activeTab === "ASSIGNED")
      return incident.status === "ASSIGNED" && incident.assignedTo === currentResponder?.name;
    if (activeTab === "RESOLVED")
      return incident.status === "RESOLVED" && incident.assignedTo === currentResponder?.name;
    return (
      incident.status === "PENDING" ||
      incident.assignedTo === currentResponder?.name
    );
  });

  const filteredIncidents = tabFiltered.filter((incident) => {
    const matchesSeverity =
      severityFilter === "ALL" || incident.severity === severityFilter;
    const matchesSearch =
      incident.title.toLowerCase().includes(search.toLowerCase()) ||
      String(incident.id).toLowerCase().includes(search.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  useEffect(() => {
    const assignedToMe = incidents.filter(
      (i) => i.status === "ASSIGNED" && i.assignedTo === currentResponder?.name
    );
    if (!assignedToMe.length) return;
    const latest = assignedToMe[assignedToMe.length - 1];
    if (latest.id !== lastPlayedId) {
      setLastPlayedId(latest.id);
      setHighlightedId(latest.id);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      const timer = setTimeout(() => setHighlightedId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [incidents]);

  return (
    <div className="flex flex-col w-full h-full bg-[#0b1420] overflow-hidden">
      <audio ref={audioRef} src="/alert.wav" preload="auto" />

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="flex lg:hidden items-center justify-between px-4 py-3 bg-[#0f1b2a] border-b border-blue-500/10 shrink-0">
        <div>
          <p className="text-xs font-bold tracking-widest text-blue-400 uppercase">
            Incident Control
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {counts.ASSIGNED} assigned · {counts.PENDING} pending · {counts.RESOLVED} resolved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition border ${
              showFilters
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-[#162435] border-blue-500/10 text-slate-400"
            }`}
          >
            Filters
          </button>
          <button
            onClick={() => setShowMap((v) => !v)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition border ${
              showMap
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-[#162435] border-blue-500/10 text-slate-400"
            }`}
          >
            {showMap ? "List" : "Map"}
          </button>
        </div>
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ===== SIDEBAR ===== */}
        <div
          className={`
            flex flex-col
            w-full lg:w-105 xl:w-120
            bg-[#0f1b2a] border-r border-blue-500/10
            overflow-hidden shrink-0
            ${showMap ? "hidden lg:flex" : "flex"}
          `}
        >
          {/* Header — desktop only */}
          <div className="hidden lg:flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
            <div>
              <h2 className="text-xs font-bold tracking-widest text-blue-400 uppercase">
                Incident Control Center
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Logged in as{" "}
                <span className="text-slate-300 font-semibold">
                  {currentResponder?.name || "Responder"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-400 font-semibold">LIVE</span>
            </div>
          </div>

          {/* ===== STATUS SUMMARY CARDS ===== */}
          <div className="px-4 lg:px-6 pb-4 shrink-0">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Pending", key: "PENDING", color: "text-yellow-400", ring: "hover:ring-yellow-500/20", bg: "bg-yellow-500/5 border-yellow-500/10" },
                { label: "Assigned", key: "ASSIGNED", color: "text-blue-400", ring: "hover:ring-blue-500/20", bg: "bg-blue-500/5 border-blue-500/10" },
                { label: "Resolved", key: "RESOLVED", color: "text-green-400", ring: "hover:ring-green-500/20", bg: "bg-green-500/5 border-green-500/10" },
              ].map(({ label, key, color, ring, bg }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`${bg} border rounded-xl px-3 py-3 text-center transition-all ring-1 ring-transparent ${ring} ${
                    activeTab === key ? "ring-blue-500/40 brightness-125" : ""
                  }`}
                >
                  <p className={`text-2xl font-bold ${color}`}>{counts[key]}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ===== TAB BAR ===== */}
          <div className="px-4 lg:px-6 pb-3 shrink-0">
            <div className="flex gap-1 p-1 bg-[#0b1420] rounded-xl border border-blue-500/10">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab}
                  <span
                    className={`text-[9px] px-1 py-0.5 rounded-full font-bold ${
                      activeTab === tab ? "bg-white/20 text-white" : "bg-[#162435] text-slate-600"
                    }`}
                  >
                    {counts[tab]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ===== FILTERS ===== */}
          <div className={`px-4 lg:px-6 pb-3 shrink-0 space-y-2 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by title or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0b1420] border border-blue-500/10 pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { label: "ALL", color: "bg-slate-600" },
                { label: "HIGH", color: "bg-red-600" },
                { label: "MEDIUM", color: "bg-orange-500" },
                { label: "LOW", color: "bg-slate-500" },
              ].map(({ label, color }) => (
                <button
                  key={label}
                  onClick={() => setSeverityFilter(label)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all border ${
                    severityFilter === label
                      ? `${color} text-white border-transparent shadow`
                      : "bg-[#0b1420] text-slate-500 border-blue-500/10 hover:border-blue-500/20 hover:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 lg:mx-6 h-px bg-blue-500/5 shrink-0" />

          {/* ===== INCIDENT LIST ===== */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-3 space-y-3 min-h-0">
            {filteredIncidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-[#162435] flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm font-medium">No incidents found</p>
                <p className="text-slate-600 text-xs mt-1">
                  {activeTab === "ALL"
                    ? "New assignments will appear here"
                    : `No ${activeTab.toLowerCase()} incidents`}
                </p>
              </div>
            ) : (
              filteredIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className={`rounded-2xl border p-4 transition-all duration-300 ${
                    highlightedId === incident.id
                      ? "ring-2 ring-green-500 animate-pulse bg-[#162435] border-green-500/30"
                      : `bg-[#111d2e] ${severityBorder(incident.severity)}`
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-blue-400/50">
                        #{String(incident.id).slice(-6)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadge(incident.status)}`}>
                        {incident.status}
                      </span>
                      {highlightedId === incident.id && (
                        <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 ${severityBadge(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-slate-100 leading-snug mb-1.5">
                    {incident.title}
                  </h3>

                  {/* Description */}
                  {incident.description && (
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-3">
                      {incident.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px]">
                    {incident.assignedTo && (
                      <span className="flex items-center gap-1 text-green-400/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {incident.assignedTo}
                      </span>
                    )}
                    {incident.location && (
                      <span className="text-blue-400/60">
                        📍 {incident.location.manual || "GPS Located"}
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  {incident.status === "ASSIGNED" &&
                    incident.assignedTo === currentResponder?.name && (
                      <button
                        onClick={() => updateStatus(incident.id, "RESOLVED")}
                        className="mt-3 w-full bg-gradient-to-r from-green-600 to-green-700
                          hover:from-green-500 hover:to-green-600
                          py-2.5 rounded-xl text-xs font-bold tracking-wide
                          shadow-lg shadow-green-600/20 transition-all active:scale-95"
                      >
                        ✓ MARK RESOLVED
                      </button>
                    )}
                </div>
              ))
            )}
            {/* <div className="h-4" /> */}
          </div>
        </div>

        {/* ===== MAP PANEL ===== */}
        <div
          className={`
            flex-1 relative min-h-0
            ${showMap ? "flex" : "hidden lg:flex"}
            flex-col
          `}
        >
          <div className="absolute inset-0">
            <MapView incidents={incidents} />
          </div>

          <LayerToggle />
          <RoutingCard />
          {/* <BottomStats incidents={incidents} /> */}

          <button
            onClick={() => setShowMap(false)}
            className="lg:hidden absolute top-4 left-4 z-[1001] bg-[#0f1b2a]/90 backdrop-blur-sm
              border border-blue-500/20 text-slate-300 text-xs font-bold
              px-3 py-2 rounded-xl shadow-lg"
          >
            ← List
          </button>
        </div>
      </div>

      <AlertBanner />
    </div>
  );
}