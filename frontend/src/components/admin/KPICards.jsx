import AnimatedProgress from "./AnimatedProgress";

export default function KPICards({ analytics, loading, respondersOnline }) {
  const totalIncidents = analytics?.total || 0;
  const activeCases = analytics?.active || 0;
  const resolvedCases = analytics?.resolved || 0;
  const closingRate = analytics?.closingRate || 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {[1, 2, 3].map((card) => (
          <div
            key={card}
            className="bg-[#121f32] rounded-2xl p-6 border border-blue-500/10 shadow-xl animate-pulse"
          >
            <div className="h-6 w-20 bg-[#1e2f44] rounded mb-6" />
            <div className="h-3 w-28 bg-[#1e2f44] rounded mb-3" />
            <div className="h-10 w-24 bg-[#1e2f44] rounded mb-2" />
            <div className="h-3 w-32 bg-[#1e2f44] rounded mb-6" />
            <div className="h-2 w-full bg-[#1e2f44] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

      {/* TOTAL INCIDENTS */}
      <div className="bg-[#121f32] rounded-2xl p-6 border border-blue-500/10 shadow-xl hover:shadow-blue-500/10 transition">

        <div className="flex justify-between items-start mb-6">
          <div className="bg-[#1e2f44] p-3 rounded-xl">
            ⚠️
          </div>
          <span className="text-emerald-400 text-sm font-semibold">
            LIVE
          </span>
        </div>

        <p className="text-slate-400 text-sm uppercase tracking-wide">
          Total Incidents
        </p>

        <h2 className="text-4xl font-bold mt-2">
          {totalIncidents}
        </h2>

        <p className="text-slate-500 text-sm mt-1">
          Reported incidents
        </p>

        <div className="mt-6">
          <AnimatedProgress
            value={Math.min(100, totalIncidents ? 100 : 0)}
            color="bg-blue-500"
          />
        </div>

      </div>

      {/* ACTIVE CASES */}
      <div className="bg-[#121f32] rounded-2xl p-6 border border-blue-500/10 shadow-xl hover:shadow-orange-500/10 transition">

        <div className="flex justify-between items-start mb-6">
          <div className="bg-[#1e2f44] p-3 rounded-xl">
            🔄
          </div>
          <span className="text-orange-400 text-sm font-semibold">
            {respondersOnline} Responders
          </span>
        </div>

        <p className="text-slate-400 text-sm uppercase tracking-wide">
          Active Cases
        </p>

        <h2 className="text-4xl font-bold mt-2">
          {activeCases}
        </h2>

        <p className="text-slate-500 text-sm mt-1">
          Pending + In Progress
        </p>

        <div className="mt-6">
          <AnimatedProgress
            value={totalIncidents ? Math.round((activeCases / totalIncidents) * 100) : 0}
            color="bg-orange-500"
          />
        </div>

      </div>

      {/* RESOLVED */}
      <div className="bg-[#121f32] rounded-2xl p-6 border border-blue-500/10 shadow-xl hover:shadow-emerald-500/10 transition">

        <div className="flex justify-between items-start mb-6">
          <div className="bg-[#1e2f44] p-3 rounded-xl">
            ✅
          </div>
          <span className="text-emerald-400 text-sm font-semibold">
            SUCCESS
          </span>
        </div>

        <p className="text-slate-400 text-sm uppercase tracking-wide">
          Resolved
        </p>

        <h2 className="text-4xl font-bold mt-2">
          {resolvedCases}
        </h2>

        <p className="text-slate-500 text-sm mt-1">
          Closing Rate: {closingRate}%
        </p>

        <div className="mt-6">
          <AnimatedProgress value={closingRate} color="bg-emerald-500" />
        </div>

      </div>

    </div>
  );
}