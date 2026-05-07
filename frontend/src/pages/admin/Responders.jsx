import { useEffect, useState, useMemo } from "react";
import { useIncidents } from "../../context/IncidentContext";
import { apiRequest } from "../../utils/api";

export default function Responders() {
  const [responders, setResponders] = useState([]);
  const [loadingResponders, setLoadingResponders] = useState(false);
  const [respondersError, setRespondersError] = useState(null);
  const [selectedAssigneeByIncidentId, setSelectedAssigneeByIncidentId] = useState(
    {}
  );
  const { incidents, overrideAssign, requesting } = useIncidents();

  // ================= LOAD RESPONDERS =================
  useEffect(() => {
    const loadResponders = async () => {
      setLoadingResponders(true);
      setRespondersError(null);

      try {
        const payload = await apiRequest("/users?role=responder", {
          method: "GET",
        });

        const users = Array.isArray(payload?.data) ? payload.data : [];
        const responderUsers = users
          .filter((u) => u.role === "responder")
          .map((u) => ({
            id: u.id || u._id,
            name: u.name,
            role: u.role,
          }))
          .filter((u) => u.id && u.name);

        setResponders(responderUsers);
      } catch (err) {
        setResponders([]);
        setRespondersError(err?.message || "Failed to fetch responders.");
      } finally {
        setLoadingResponders(false);
      }
    };

    loadResponders();
  }, []);

  // ================= BUILD STATS =================
  const responderStats = useMemo(() => {
    const stats = {};

    incidents.forEach((incident) => {
      if (!incident.assignedTo) return;

      if (!stats[incident.assignedTo]) {
        stats[incident.assignedTo] = {
          assigned: 0,
          resolved: 0,
          responseTimes: [],
          lastHandled: 0,
        };
      }

      if (incident.status === "ASSIGNED") {
        stats[incident.assignedTo].assigned++;
      }

      if (incident.status === "RESOLVED") {
        stats[incident.assignedTo].resolved++;

        const time =
          new Date(incident.updatedAt) -
          new Date(incident.createdAt);

        stats[incident.assignedTo].responseTimes.push(time);

        stats[incident.assignedTo].lastHandled =
          new Date(incident.updatedAt).getTime();
      }
    });

    return stats;
  }, [incidents]);

  // ================= CALCULATIONS =================
  const getAvgResponseTime = (name) => {
    const times = responderStats[name]?.responseTimes || [];
    if (!times.length) return "—";

    const avg =
      times.reduce((a, b) => a + b, 0) /
      times.length /
      60000;

    return `${Math.round(avg)} min`;
  };

  const getEfficiencyScore = (name) => {
    const stats = responderStats[name];
    if (!stats || !stats.resolved) return 0;

    const avgTime =
      stats.responseTimes.reduce((a, b) => a + b, 0) /
      stats.responseTimes.length;

    return Math.max(100 - avgTime / 60000, 0).toFixed(0);
  };

  const getIdleTime = (name) => {
    const last = responderStats[name]?.lastHandled;
    if (!last) return "—";

    const diff = Date.now() - last;
    return `${Math.floor(diff / 60000)} min ago`;
  };

  // ================= DYNAMIC OVERLOAD =================
  const avgLoad =
    incidents.filter((i) => i.status === "ASSIGNED").length /
    (responders.length || 1);

  const OVERLOAD_LIMIT = Math.ceil(avgLoad * 1.5);

  // ================= TOP PERFORMER =================
  const topPerformer = useMemo(() => {
    let top = null;
    let max = 0;

    Object.entries(responderStats).forEach(([name, data]) => {
      if (data.resolved > max) {
        max = data.resolved;
        top = name;
      }
    });

    return top;
  }, [responderStats]);

  const pendingIncidents = incidents.filter((i) => i.status === "PENDING");
  const defaultResponderId = responders[0]?.id || "";

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-white">
          Responders Management
        </h1>
        <p className="text-slate-400 text-sm">
          Operational workload & performance intelligence.
        </p>
      </div>

      {respondersError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 text-sm">
          {respondersError}
        </div>
      )}

      {pendingIncidents.length > 0 && (
        <div className="bg-[#121f32] rounded-2xl border border-blue-500/10 overflow-hidden shadow-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">
            Pending Incidents (Assign)
          </h2>

          <div className="space-y-3">
            {pendingIncidents.map((incident) => {
              const selectedId =
                selectedAssigneeByIncidentId[incident.id] ||
                defaultResponderId;

              return (
                <div
                  key={incident.id}
                  className="flex items-center justify-between gap-4 bg-[#0f1b2a] border border-blue-500/10 rounded-xl p-4"
                >
                  <div>
                    <p className="text-xs text-blue-400 font-bold">
                      #{incident.id}
                    </p>
                    <p className="text-sm text-white font-semibold mt-1">
                      {incident.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedId}
                      onChange={(e) =>
                        setSelectedAssigneeByIncidentId((prev) => ({
                          ...prev,
                          [incident.id]: e.target.value,
                        }))
                      }
                      className="bg-[#0f1b2a] text-white text-xs p-2 rounded-lg border border-blue-500/10"
                      disabled={!defaultResponderId || loadingResponders}
                    >
                      {responders.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() =>
                        overrideAssign(
                          incident.id,
                          selectedAssigneeByIncidentId[incident.id] ||
                            defaultResponderId
                        )
                      }
                      disabled={!defaultResponderId || loadingResponders || requesting}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                    >
                      {loadingResponders || requesting ? "Loading..." : "Assign"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-[#121f32] rounded-2xl border border-blue-500/10 overflow-hidden shadow-xl">
        <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-[#0f1b2a] text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Assigned</th>
              <th className="px-6 py-4 text-left">Resolved</th>
              <th className="px-6 py-4 text-left">Efficiency</th>
              <th className="px-6 py-4 text-left">Idle</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Reassign</th>
            </tr>
          </thead>

          <tbody>
            {responders.map((responder) => {
              const stats = responderStats[responder.name] || {
                assigned: 0,
                resolved: 0,
              };

              const activeIncidents = incidents.filter(
                (i) =>
                  i.status === "ASSIGNED" &&
                  i.assignedTo === responder.name
              );

              const isOverloaded =
                stats.assigned >= OVERLOAD_LIMIT;

              const isTop =
                responder.name === topPerformer;

              return (
                <tr
                  key={responder.id}
                  className={`border-t border-blue-500/5 ${
                    isTop ? "bg-yellow-500/5" : ""
                  }`}
                >
                  <td className="px-6 py-4 text-white font-semibold">
                    {isTop && "🥇 "}
                    {responder.name}
                  </td>

                  <td className="px-6 py-4 text-purple-400 uppercase text-xs font-semibold">
                    {responder.role}
                  </td>

                  <td className="px-6 py-4 text-blue-400 font-semibold">
                    {stats.assigned}
                  </td>

                  <td className="px-6 py-4 text-green-400 font-semibold">
                    {stats.resolved}
                  </td>

                  <td className="px-6 py-4 text-cyan-400 font-semibold">
                    {getEfficiencyScore(responder.name)}%
                  </td>

                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {getIdleTime(responder.name)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        isOverloaded
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {isOverloaded ? "OVERLOADED" : "ACTIVE"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {activeIncidents.map((incident) => (
                      <div key={incident.id} className="flex items-center gap-2">
                        <select
                          onChange={(e) =>
                            setSelectedAssigneeByIncidentId((prev) => ({
                              ...prev,
                              [incident.id]: e.target.value,
                            }))
                          }
                          className="bg-[#0f1b2a] text-white text-xs p-2 rounded-lg border border-blue-500/10"
                          defaultValue={responder.id}
                        >
                          {responders.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() =>
                            overrideAssign(
                              incident.id,
                              selectedAssigneeByIncidentId[incident.id] ||
                                responder.id
                            )
                          }
                          disabled={requesting}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                        >
                          {requesting ? "Loading..." : "Assign"}
                        </button>
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
        </div>
      </div>
    </div>
  );
}