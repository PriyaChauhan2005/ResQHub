export default function AssetPanel({ users = [], responderLoad = {}, loading = false }) {
  const responderUsers = users.filter((u) => u.role === "responder");

  const dynamicRows = responderUsers.slice(0, 3).map((user) => {
    const load = responderLoad[user.name] || 0;
    return {
      id: user.id || user._id,
      name: `${user.name}`,
      status: load > 0 ? `Engaged (${load})` : "Available",
      statusClass: load > 0 ? "text-orange-400" : "text-emerald-400",
    };
  });

  const fallbackRows = [
    { id: "f1", name: "Responder Unit A", status: "Available", statusClass: "text-emerald-400" },
    { id: "f2", name: "Responder Unit B", status: "Standby", statusClass: "text-blue-400" },
    { id: "f3", name: "Responder Unit C", status: "Engaged", statusClass: "text-orange-400" },
  ];

  const rows = dynamicRows.length ? dynamicRows : fallbackRows;

  return (
    <div className="bg-[#162435] border border-blue-500/10 rounded-2xl p-6">

      <h3 className="font-semibold mb-4">
        Active Assets
      </h3>

      <div className="space-y-4 text-sm">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-[#0f1b2a] rounded-xl animate-pulse"
            />
          ))
        ) : (
          rows.map((row) => (
            <Asset
              key={row.id}
              name={row.name}
              status={row.status}
              statusClass={row.statusClass}
            />
          ))
        )}

      </div>
    </div>
  );
}

function Asset({ name, status, statusClass = "text-blue-400" }) {
  return (
    <div className="flex justify-between items-center p-3 bg-[#0f1b2a] rounded-xl">

      <span>{name}</span>

      <span className={`text-xs font-semibold ${statusClass}`}>
        {status}
      </span>

    </div>
  );
}