import { useState } from "react";
import { useIncidents } from "../../context/IncidentContext";

export default function VictimRegistry() {
  const { incidents } = useIncidents();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const filtered = incidents.filter(
    (i) =>
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.id?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ================= CSV EXPORT =================
  const exportCSV = () => {
    const headers = [
      "Incident ID",
      "Type",
      "Severity",
      "Status",
      "Latitude",
      "Longitude",
    ];

    const rows = filtered.map((i) => [
      i.id,
      i.title,
      i.severity,
      i.status,
      i.location?.lat || "",
      i.location?.lng || "",
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "victim_registry.csv";
    link.click();
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Victim Registry
          </h1>
          <p className="text-slate-400 text-sm">
            Monitor and manage all emergency reports.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Export CSV
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-[#121f32] p-6 rounded-2xl border border-blue-500/10">
        <input
          type="text"
          placeholder="Search by ID or Incident..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-[#1e2f44] text-sm px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* TABLE */}
      <div className="bg-[#121f32] rounded-2xl border border-blue-500/10 overflow-hidden">

        <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-[#0f1b2a] text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 text-left">ID</th>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-left">Severity</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Location</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-10 text-slate-500"
                >
                  No incidents found.
                </td>
              </tr>
            ) : (
              paginatedData.map((incident) => (
                <tr
                  key={incident.id}
                  className="border-t border-blue-500/5 hover:bg-[#162435]/40 transition"
                >
                  <td className="px-6 py-4 text-blue-400 font-semibold">
                    {incident.id}
                  </td>

                  <td className="px-6 py-4 text-white">
                    {incident.title}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        incident.severity === "HIGH"
                          ? "bg-red-600/20 text-red-400"
                          : incident.severity === "MEDIUM"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {incident.severity}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        incident.status === "PENDING"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : incident.status === "ASSIGNED"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {incident.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {incident.location
                      ? `${incident.location.lat.toFixed(
                          2
                        )}, ${incident.location.lng.toFixed(2)}`
                      : "N/A"}
                  </td>

                  <td className="px-6 py-4 text-right">
                  <span className="px-3 py-1 text-xs rounded-lg bg-slate-700 text-slate-400">
                    —
                  </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-6 bg-[#0f1b2a]">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white"
                    : "bg-[#162435] text-slate-400"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}