export default function IncidentDistribution({ incidents = [] }) {

  const high = incidents.filter(i => i.severity === "HIGH").length;
  const medium = incidents.filter(i => i.severity === "MEDIUM").length;
  const low = incidents.filter(i => i.severity === "LOW").length;

  const total = high + medium + low;

  return (
    <div className="bg-[#162435] border border-blue-500/10 rounded-2xl p-6">

      <h3 className="font-semibold mb-4">
        Incident Type Distribution
      </h3>

      <Bar
        label="High Severity"
        value={high}
        percentage={total ? (high / total) * 100 : 0}
        color="bg-red-500"
      />

      <Bar
        label="Medium Severity"
        value={medium}
        percentage={total ? (medium / total) * 100 : 0}
        color="bg-orange-500"
      />

      <Bar
        label="Low Severity"
        value={low}
        percentage={total ? (low / total) * 100 : 0}
        color="bg-slate-500"
      />

    </div>
  );
}

function Bar({ label, value, percentage, color }) {
  return (
    <div className="mb-4">
      
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div className="w-full bg-[#0f1b2a] h-2 rounded-full overflow-hidden">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{
            width: `${percentage}%`,
            maxWidth: "100%"
          }}
        />
      </div>

    </div>
  );
}