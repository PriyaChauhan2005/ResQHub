const statusToLabel = (status) =>
  status === "ASSIGNED" ? "IN_PROGRESS" : status || "PENDING";

const statusClass = (status) => {
  const normalized = statusToLabel(status);
  if (normalized === "RESOLVED") return "text-green-400";
  if (normalized === "IN_PROGRESS") return "text-orange-400";
  return "text-red-400";
};

const severityClass = (severity) => {
  if (severity === "HIGH") return "text-red-400";
  if (severity === "MEDIUM") return "text-orange-400";
  return "text-blue-400";
};

export default function EscalationsSection({ incidents = [], loading = false }) {
  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const exportCsv = () => {
    const headers = ["Incident ID", "Title", "Severity", "Status", "Created At"];
    const rows = recentIncidents.map((incident) => [
      incident.id,
      incident.title || "",
      incident.severity || "",
      statusToLabel(incident.status),
      incident.createdAt ? new Date(incident.createdAt).toISOString() : "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((item) => `"${String(item).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "recent-escalations.csv";
    link.click();
  };

  if (loading) {
    return (
      <div className="bg-[#0f1b2a] border border-blue-500/10 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Recent Escalations</h2>
        </div>
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#162435] p-4 rounded-lg h-14" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1b2a] border border-blue-500/10 rounded-2xl p-6">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">
          Recent Escalations
        </h2>

        <button
          onClick={exportCsv}
          className="text-blue-400 text-sm font-semibold hover:underline"
        >
          Export CSV
        </button>
      </div>

      <div className="space-y-4">
        {recentIncidents.length === 0 ? (
          <div className="text-sm bg-[#162435] p-4 rounded-lg text-slate-400">
            No incidents available yet.
          </div>
        ) : (
          recentIncidents.map((incident) => (
            <div
              key={incident.id}
              className="flex justify-between text-sm bg-[#162435] p-4 rounded-lg gap-4"
            >
              <div className="min-w-0">
                <p className="text-white truncate">{incident.title || "Untitled Incident"}</p>
                <p className={`text-xs mt-1 font-semibold ${severityClass(incident.severity)}`}>
                  Severity: {incident.severity || "LOW"}
                </p>
              </div>
              <span className={`font-semibold shrink-0 ${statusClass(incident.status)}`}>
                {statusToLabel(incident.status)}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}