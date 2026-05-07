import { useMemo, useEffect, useState } from "react";
import { useIncidents } from "../../context/IncidentContext";
import { apiRequest } from "../../utils/api";
import AdminHeader from "../../components/admin/AdminHeader";

import KPICards from "../../components/admin/KPICards";
import HeatmapSection from "../../components/admin/HeatmapSection";
import IncidentDistribution from "../../components/admin/IncidentDistribution";
import AssetPanel from "../../components/admin/AssetPanel";
import EscalationsSection from "../../components/admin/EscalationsSection";

export default function CommandCenter() {
  const { incidents, loading, error } = useIncidents();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);

      try {
        const payload = await apiRequest("/users", { method: "GET" });
        setUsers(Array.isArray(payload?.data) ? payload.data : []);
      } catch (err) {
        setUsersError(err?.message || "Failed to load users.");
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredIncidents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return incidents;

    return incidents.filter((incident) => {
      const title = (incident.title || "").toLowerCase();
      const statusRaw = (incident.status || "").toLowerCase();
      const statusNormalized =
        statusRaw === "assigned" ? "in_progress" : statusRaw;
      const severity = (incident.severity || "").toLowerCase();

      return (
        title.includes(query) ||
        statusRaw.includes(query) ||
        statusNormalized.includes(query) ||
        severity.includes(query)
      );
    });
  }, [incidents, search]);

  // ================= MASTER ANALYTICS ENGINE =================
  const analytics = useMemo(() => {
    const data = {
      total: 0,
      pending: 0,
      assigned: 0,
      resolved: 0,
      active: 0,
      closingRate: 0,
      high: 0,
      medium: 0,
      low: 0,
      criticalSeverity: 0,
      avgResolutionTime: 0,
      avgResolutionTimeLabel: "0 min",
      slowestResolutionTime: "0 min",
      surgeDetected: false,
    };

    const now = Date.now();
    const THIRTY_MIN = 30 * 60 * 1000;
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const MAX_TIME = 6 * 60 * 60 * 1000;

    let resolutionTimes = [];
    let recentCount = 0;

    filteredIncidents.forEach((incident) => {
      data.total++;

      // Status counts
      if (incident.status === "PENDING") data.pending++;
      if (incident.status === "ASSIGNED" || incident.status === "IN_PROGRESS") {
        data.assigned++;
      }
      if (incident.status === "RESOLVED") data.resolved++;

      // Severity counts
      if (incident.severity === "HIGH") data.high++;
      if (incident.severity === "MEDIUM") data.medium++;
      if (incident.severity === "LOW") data.low++;

      if (incident.severity === "HIGH" && incident.status !== "RESOLVED") {
        data.criticalSeverity++;
      }

      // Resolution time (recent + valid only)
      if (
        incident.status === "RESOLVED" &&
        incident.createdAt &&
        incident.updatedAt &&
        Date.now() - new Date(incident.createdAt).getTime() < ONE_DAY
      ) {
        const time =
          new Date(incident.updatedAt) -
          new Date(incident.createdAt);

        if (time > 0 && time < MAX_TIME) {
          resolutionTimes.push(time);
        }
      }

      // Surge detection (last 30 min)
      if (now - new Date(incident.createdAt).getTime() < THIRTY_MIN) {
        recentCount++;
      }
    });

    const avgMinutes = resolutionTimes.length
      ? Math.round(
          resolutionTimes.reduce((a, b) => a + b, 0) /
            resolutionTimes.length /
            60000
        )
      : 0;

    data.avgResolutionTime =
      avgMinutes > 60
        ? `${Math.round(avgMinutes / 60)} hrs`
        : `${avgMinutes} min`;
    data.avgResolutionTimeLabel = data.avgResolutionTime;

    const slowestMs = resolutionTimes.length
      ? Math.max(...resolutionTimes)
      : 0;
    const slowestMinutes = Math.round(slowestMs / 60000);
    data.slowestResolutionTime =
      slowestMinutes > 60
        ? `${Math.round(slowestMinutes / 60)} hrs`
        : `${slowestMinutes} min`;

    data.surgeDetected = recentCount >= 5;
    data.active = data.pending + data.assigned;
    data.closingRate = data.total
      ? Math.round((data.resolved / data.total) * 100)
      : 0;

    return data;
  }, [filteredIncidents]);

  // ================= ESCALATION DETECTION =================
  const ESCALATION_TIME = 10 * 60 * 1000;

  const escalatedIncidents = useMemo(() => {
    return filteredIncidents.filter(
      (i) =>
        i.status === "PENDING" &&
        Date.now() - new Date(i.createdAt).getTime() > ESCALATION_TIME
    );
  }, [filteredIncidents]);

  // ================= RESPONDER LOAD =================
  const responderLoad = useMemo(() => {
    return filteredIncidents.reduce((acc, curr) => {
      if (!curr.assignedTo) return acc;

      if (!acc[curr.assignedTo]) {
        acc[curr.assignedTo] = 0;
      }

      if (curr.status === "ASSIGNED") {
        acc[curr.assignedTo]++;
      }

      return acc;
    }, {});
  }, [filteredIncidents]);

  return (
    <div className="space-y-10">
      <AdminHeader onSearch={setSearch} />

      {(error || usersError) && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-300">
          {error || usersError}
        </div>
      )}

      {!loading && search.trim() && filteredIncidents.length === 0 && (
        <div className="bg-[#162435] border border-blue-500/10 rounded-xl p-4 text-sm text-slate-300">
          No results found for "{search}".
        </div>
      )}

      {/* KPI SECTION */}
      <KPICards
        analytics={analytics}
        loading={loading || usersLoading}
        respondersOnline={users.filter((u) => u.role === "responder").length}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">

        <div className="xl:col-span-8">
          <HeatmapSection
            incidents={filteredIncidents}
            escalated={escalatedIncidents}
            surgeDetected={analytics.surgeDetected}
          />
        </div>

        <div className="xl:col-span-4 space-y-6 lg:space-y-8">
          <IncidentDistribution incidents={filteredIncidents} />
          <AssetPanel
            responderLoad={responderLoad}
            users={users}
            loading={usersLoading}
          />
        </div>

      </div>

      <EscalationsSection
        incidents={filteredIncidents}
        loading={loading}
      />

    </div>
  );
}