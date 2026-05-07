import { useMemo } from "react";
import { useIncidents } from "../../context/IncidentContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function DeepAnalytics() {
  const { incidents } = useIncidents();
  const getMedal = (rank) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "";
};


  // ================= TREND DATA (STABLE + SORTED) =================
  const trendData = useMemo(() => {
    const grouped = {};

    incidents.forEach((incident) => {
      const date = new Date(incident.createdAt)
        .toISOString()
        .split("T")[0]; // safer than locale

      if (!grouped[date]) grouped[date] = 0;
      grouped[date]++;
    });

    return Object.entries(grouped)
      .map(([date, count]) => ({
        date,
        incidents: count,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [incidents]);

  // ================= RANKING DATA =================
  const rankingData = useMemo(() => {
  const map = {};

  incidents.forEach((i) => {
    if (!i.assignedTo) return;

    if (!map[i.assignedTo]) {
      map[i.assignedTo] = 0;
    }

    if (i.status === "RESOLVED") {
      map[i.assignedTo]++;
    }
  });

  const sorted = Object.entries(map)
    .map(([name, resolved]) => ({ name, resolved }))
    .sort((a, b) => b.resolved - a.resolved);

  return sorted.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}, [incidents]);  

// ================= SURGE DETECTION =================
const surgeDetected = useMemo(() => {
  const THIRTY_MIN = 30 * 60 * 1000;
  const now = Date.now();

  const recentIncidents = incidents.filter(
    (i) =>
      now - new Date(i.createdAt).getTime() < THIRTY_MIN
  );

  return recentIncidents.length >= 5; 
}, [incidents]);

  // ================= SEVERITY DATA =================
  const severityData = useMemo(() => {
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };

    incidents.forEach((i) => {
      if (counts[i.severity] !== undefined) {
        counts[i.severity]++;
      }
    });

    return Object.keys(counts).map((key) => ({
      severity: key,
      count: counts[key],
    }));
  }, [incidents]);

  // ================= STATUS DATA =================
  const statusData = useMemo(() => {
    const counts = { PENDING: 0, ASSIGNED: 0, RESOLVED: 0 };

    incidents.forEach((i) => {
      if (counts[i.status] !== undefined) {
        counts[i.status]++;
      }
    });

    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
    }));
  }, [incidents]);

  // ================= RESOLUTION PERFORMANCE =================
  const resolutionStats = useMemo(() => {
    const resolved = incidents.filter(
      (i) => i.status === "RESOLVED"
    );

    if (resolved.length === 0) {
      return { avg: 0, fastest: 0, slowest: 0 };
    }

    const times = resolved.map(
      (i) =>
        new Date(i.updatedAt) - new Date(i.createdAt)
    );

    const total = times.reduce((a, b) => a + b, 0);

    return {
      avg: Math.round(total / times.length / 60000),
      fastest: Math.round(Math.min(...times) / 60000),
      slowest: Math.round(Math.max(...times) / 60000),
    };
  }, [incidents]);

  // ================= ESCALATION STATS =================
  const ESCALATION_TIME = 10 * 60 * 1000;

  const escalationStats = useMemo(() => {
    const escalated = incidents.filter(
      (i) =>
        i.status === "PENDING" &&
        Date.now() - new Date(i.createdAt) > ESCALATION_TIME
    );

    return {
      count: escalated.length,
      rate: incidents.length
        ? ((escalated.length / incidents.length) * 100).toFixed(1)
        : 0,
    };
  }, [incidents]);

  const COLORS = ["#f97316", "#3b82f6", "#22c55e"];

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Deep Analytics
        </h1>
        <p className="text-slate-400 text-sm">
          Advanced system-wide emergency intelligence insights.
        </p>
      </div>

      {/* ================= PERFORMANCE METRICS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Avg Resolution" value={`${resolutionStats.avg} min`} />
        <StatCard title="Fastest" value={`${resolutionStats.fastest} min`} />
        <StatCard title="Slowest" value={`${resolutionStats.slowest} min`} />
        <StatCard title="Escalation Rate" value={`${escalationStats.rate}%`} />
      </div>

      {/* ================= INCIDENT TREND ================= */}
      <div className="bg-[#121f32] rounded-2xl p-6 border border-blue-500/10 shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-6">
          Incident Trend Over Time
        </h2>

        <div className="h-[260px] sm:h-[300px]">
          <ResponsiveContainer>
            <LineChart data={trendData}>
              <CartesianGrid stroke="#1e2f44" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="incidents"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= TWO COLUMN CHARTS ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">

        {/* Severity Bar */}
        <div className="xl:col-span-6 bg-[#121f32] rounded-2xl p-4 sm:p-6 border border-blue-500/10 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-6">
            Severity Distribution
          </h2>

          <div className="h-[260px] sm:h-[300px]">
            <ResponsiveContainer>
              <BarChart data={severityData}>
                <CartesianGrid stroke="#1e2f44" />
                <XAxis dataKey="severity" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Donut */}
        <div className="xl:col-span-6 bg-[#121f32] rounded-2xl p-4 sm:p-6 border border-blue-500/10 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-6">
            Status Distribution
          </h2>

          <div className="h-[260px] sm:h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  minAngle={10}  
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ================= RESPONDER RANKING ================= */}
<div className="bg-[#121f32] rounded-2xl p-4 sm:p-6 border border-blue-500/10 shadow-xl relative">

  {surgeDetected && (
    <div className="absolute top-4 right-4 bg-red-500/20 text-red-400 px-4 py-2 text-xs rounded-full animate-pulse">
      ⚠ SURGE DETECTED
    </div>
  )}

  <h2 className="text-lg font-semibold text-white mb-6">
    Responder Ranking (Resolved Cases)
  </h2>

  <div className="h-[260px] sm:h-[300px]">
    <ResponsiveContainer>
      <BarChart data={rankingData}>
        <CartesianGrid stroke="#1e2f44" />
        <XAxis dataKey="name" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          formatter={(value, name, props) => [
            value,
            `Resolved Cases`,
          ]}
          labelFormatter={(label) => {
            const responder = rankingData.find(r => r.name === label);
            return `${getMedal(responder?.rank)} ${label}`;
          }}
        />

        <Bar
          dataKey="resolved"
          radius={[10, 10, 0, 0]}
          isAnimationActive={true}
          animationDuration={800}
        >
          {rankingData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.rank === 1
                  ? "#facc15"
                  : entry.rank === 2
                  ? "#94a3b8"
                  : entry.rank === 3
                  ? "#f97316"
                  : "#22c55e"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>

  {/* Medal Legend */}
  <div className="mt-6 space-y-2">
    {rankingData.slice(0, 3).map((r) => (
      <div
        key={r.name}
        className={`flex items-center justify-between px-4 py-2 rounded-xl ${
          r.rank === 1
            ? "bg-yellow-500/10 border border-yellow-500/20"
            : "bg-blue-500/5"
        }`}
      >
        <span className="text-white font-medium">
          {getMedal(r.rank)} {r.name}
        </span>
        <span className="text-green-400 font-semibold">
          {r.resolved} resolved
        </span>
      </div>
    ))}
  </div>

</div>
</div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-[#121f32] rounded-2xl p-6 border border-blue-500/10 shadow-xl">
      <p className="text-sm text-slate-400 mb-2">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
  );
}