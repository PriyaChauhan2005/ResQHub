import { useState, useEffect } from "react";
import { useIncidents } from "../../context/IncidentContext";
import { Link } from "react-router-dom";


function StatCard({ label, value, color }) {
  const colors = {
    blue: "text-blue-400",
    yellow: "text-yellow-400",
    orange: "text-orange-400",
    green: "text-green-400",
  };

  return (
    <div className="bg-slate-900 border border-blue-500/10 p-4 rounded-xl text-center">
      <p className="text-xs text-slate-400 uppercase">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color]}`}>
        {value}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [incidentType, setIncidentType] = useState("Medical Emergency");
  const [urgency, setUrgency] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState("");
  const [locationError, setLocationError] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);


  const { addIncident, incidents } = useIncidents();

  // 🔴 Read Offline Incidents
const offlineIncidents =
  JSON.parse(localStorage.getItem("offlineIncidents")) || [];

// Merge Online + Offline
const allIncidents = [...incidents, ...offlineIncidents];


  // Detect Location
  const detectLocation = () => {
  setDetectingLocation(true);
  if (!navigator.geolocation) {
    setLocationError(true);
    setDetectingLocation(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setLocationError(false);
      setDetectingLocation(false);
    },
    () => {
      setLocationError(true);
      setDetectingLocation(false);
    }
  );
};


  // Submit Form
  const handleSubmit = async (e) => {
  e.preventDefault();

 if (!location && !manualLocation) {
  alert("Please provide location");
  return;
}

  const isOnline = navigator.onLine;

  const newIncident = {
    id: Date.now(),
    title: incidentType,
    description,
    severity: urgency,
    location: location || { manual: manualLocation },
    status: "PENDING",
  };

  // 🔴 OFFLINE MODE
  if (!isOnline) {
    const offlineIncidents =
      JSON.parse(localStorage.getItem("offlineIncidents")) || [];

    localStorage.setItem(
      "offlineIncidents",
      JSON.stringify([
        ...offlineIncidents,
        { ...newIncident, synced: false },
      ])
    );

    alert(
      "⚠ Offline Mode: Incident saved locally. Will sync when connection returns."
    );

    // Reset form
    setDescription("");
    setLocation(null);
    setUrgency("MEDIUM");

    return; // STOP here if offline
  }

  // 🟢 ONLINE MODE (normal flow)
  setSubmitting(true);
  const created = await addIncident(newIncident);
  setSubmitting(false);

  if (!created) {
    alert("Failed to submit emergency report.");
    return;
  }

  alert("Emergency report submitted successfully.");

  setDescription("");
  setLocation(null);
  setUrgency("MEDIUM");
};

  // Show active (non-resolved) reports
  const myReports = allIncidents.filter(
    (incident) => incident.status !== "RESOLVED"
  );

const total = allIncidents.length;
const pending = allIncidents.filter(i => i.status === "PENDING").length;
const assigned = allIncidents.filter(i => i.status === "ASSIGNED").length;
const resolved = allIncidents.filter(i => i.status === "RESOLVED").length;

  // 🔥 REAL-TIME INCIDENT HIGHLIGHT
useEffect(() => {
  if (allIncidents.length === 0) return;

  const latestIncident = allIncidents[allIncidents.length - 1];

  if (!latestIncident) return;

  setHighlightedId(latestIncident.id);

  const timer = setTimeout(() => {
    setHighlightedId(null);
  }, 3000); // highlight duration

  return () => clearTimeout(timer);

}, [allIncidents.length]);


  // 🔁 AUTO SYNC WHEN INTERNET RETURNS
useEffect(() => {
  const handleOnline = () => {
    const offlineIncidents =
      JSON.parse(localStorage.getItem("offlineIncidents")) || [];

    if (offlineIncidents.length === 0) return;

    offlineIncidents.forEach((incident) => {
      addIncident({
        ...incident,
        synced: true,
      });
    });

    localStorage.removeItem("offlineIncidents");

    alert("✅ Connection restored. Offline incidents synced successfully.");
  };

  window.addEventListener("online", handleOnline);

  return () => {
    window.removeEventListener("online", handleOnline);
  };
}, [addIncident]);


  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">

      {/* 🔷 PAGE HEADER */}
<div className="lg:col-span-12 border-b border-blue-500/10 mb-6">
  <div className="flex items-center justify-between">
    
    <div>
      <h1 className="text-2xl md:text-2xl font-semibold tracking-tight">
        ResQ<span className="text-blue-400">Hub</span> Victim Dashboard
      </h1>
      <p className="text-sm text-slate-400 mt-1">
        Report incidents and track emergency response status in real-time.
      </p>
    </div>

    <div className="hidden md:flex items-center gap-2 bg-blue-600/10 px-4 py-2 rounded-xl border border-blue-500/20">
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
      <span className="text-xs font-semibold text-blue-300">
        System Active
      </span>
    </div>

  </div>
</div>


      {/* LEFT SECTION */}
      <div className="lg:col-span-7 space-y-6">

        {/* 📊 STATUS SUMMARY */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <StatCard label="Total Reports" value={total} color="blue" />
  <StatCard label="Pending" value={pending} color="yellow" />
  <StatCard label="Assigned" value={assigned} color="orange" />
  <StatCard label="Resolved" value={resolved} color="green" />
</div>


        <section className="bg-slate-900 rounded-xl p-6 border border-blue-500/10">
          <h2 className="text-lg font-bold mb-6 uppercase tracking-tight">
            Report New Emergency
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Incident Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Incident Type
              </label>

              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full bg-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm py-3 px-4"
              >
                <option>Medical Emergency</option>
                <option>Fire Incident</option>
                <option>Natural Disaster</option>
                <option>Security Threat</option>
                <option>Missing Person</option>
              </select>
            </div>

            {/* Urgency Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Urgency Level
              </label>

              <div className="flex gap-2">
                {["HIGH", "MEDIUM", "LOW"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setUrgency(level)}
                    className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold transition ${
                      urgency === level
                        ? level === "HIGH"
                          ? "bg-red-600 text-white"
                          : level === "MEDIUM"
                          ? "bg-orange-500 text-white"
                          : "bg-slate-600 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                Description (optional)
                {/* <span className="text-blue-400 normal-case font-normal italic">
                  AI-assisted detection active
                </span> */}
              </label>

              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm p-4"
                placeholder="Add details if possible..."
              />
            </div>

            {/* Location */}
<div className="space-y-2">
  <label className="text-xs font-bold text-slate-500 uppercase">
    Current Location
  </label>

  <div className="h-40 w-full rounded-lg bg-slate-800 border border-blue-500/10 flex items-center justify-center">
    {location ? (
      <p className="text-blue-400 text-sm">
        Lat: {location.lat.toFixed(4)} | Lng:{" "}
        {location.lng.toFixed(4)}
      </p>
    ) : (
      <span className="text-slate-500 text-sm">
        Location Preview will appear here
      </span>
    )}
  </div>

  <button
    type="button"
    onClick={detectLocation}
    disabled={detectingLocation}
    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-600/20 disabled:opacity-60"
  >
    {detectingLocation ? "Loading..." : "Detect My Location"}
  </button>

  {/* 🔴 Manual Location Fallback */}
  
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-3">
      <p className="text-yellow-400 text-xs mb-2">
        Unable to auto-detect location. Please enter nearest landmark.
      </p>

      <input
        type="text"
        placeholder="Nearest landmark or area"
        value={manualLocation}
        onChange={(e) => setManualLocation(e.target.value)}
        className="w-full bg-slate-800 rounded-lg text-sm py-2 px-3 border border-yellow-500/30 focus:ring-2 focus:ring-yellow-500"
      />
    </div>
</div>

            {/* Submit */}
<button
  type="submit"
  disabled={submitting}
  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all"
>
  {submitting ? "Loading..." : "SUBMIT EMERGENCY REPORT"}
</button>

          </form>
        </section>

      </div>
  
      {/* RIGHT SECTION */}
      <div className="lg:col-span-5 space-y-6">

        {/* Active Reports */}
        <section className="bg-slate-900 rounded-xl p-6 border border-blue-500/10">
          <h2 className="text-lg font-bold mb-4 uppercase tracking-tight">
            Active Reports
          </h2>

          {myReports.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No active reports yet.
            </p>
          ) : (
            <div className="space-y-4">
              {myReports.map((report) => (
                <div
  key={report.id}
  className={`p-4 rounded-xl bg-slate-800 border border-blue-500/10 transition-all duration-300
    ${highlightedId === report.id ? "animate-flash border-red-500" : ""}
  `}
>
                  <div className="flex justify-between mb-2 items-center">
  <span className="text-xs font-bold text-blue-400">
    #{report.id}
  </span>

  <div className="flex items-center gap-2">
    <span className="text-xs font-bold text-orange-400">
      {report.status}
    </span>

    {report.synced === false && (
      <span className="text-yellow-400 text-[10px] font-bold bg-yellow-400/10 px-2 py-1 rounded">
        Pending Sync
      </span>
    )}
  </div>
</div>

                  <p className="text-sm font-semibold">
                    {report.title}
                  </p>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    {report.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Immediate Actions */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
          <h2 className="font-bold text-sm uppercase tracking-wider mb-4">
            Immediate Actions
          </h2>

          <ul className="space-y-3 text-xs">
            <li>1. Move to a safe location.</li>
            <li>2. Keep phone screen on and volume high.</li>
            <li>3. Gather important documents.</li>
          </ul>
        </section>

      </div>

    </div>
  );
}