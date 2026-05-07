import { useMemo } from "react";

const AVERAGE_SPEED_KMH = 40;

const toRad = (deg) => (deg * Math.PI) / 180;

const haversineKm = (from, to) => {
  const R = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function RoutingCard({ userLocation, incidentLocation }) {
  const etaMinutes = useMemo(() => {
    if (!userLocation || !incidentLocation) return null;

    const distanceKm = haversineKm(
      { lat: userLocation[0], lng: userLocation[1] },
      { lat: incidentLocation[0], lng: incidentLocation[1] }
    );

    const etaHours = distanceKm / AVERAGE_SPEED_KMH;
    return Math.max(1, Math.round(etaHours * 60));
  }, [userLocation, incidentLocation]);

  const etaLabel =
    etaMinutes == null ? "ETA unavailable" : `Approximate ${etaMinutes} mins`;
  const progressWidth =
    etaMinutes == null ? 0 : Math.max(10, Math.min(100, 100 - etaMinutes));

  return (
    <div className="absolute top-4 right-4 left-4 sm:left-auto sm:top-6 sm:right-6 sm:w-[320px] bg-[#162435]/60 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-2xl shadow-2xl shadow-blue-500/10 z-[1000]">

      <p className="text-xs text-slate-400 uppercase font-semibold">
        Suggested Route
      </p>

      <p className="mt-4 text-sm text-slate-300">
        Route estimate based on current and incident coordinates.
      </p>

      <div className="mt-6">
        <p className="text-xs text-slate-400 mb-2">Current ETA</p>

        <div className="w-full bg-[#0b1420] h-2 rounded-full">
          <div
            className="bg-green-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        <p className="mt-2 text-green-400 font-bold">
          {etaLabel}
        </p>
      </div>

    </div>
  );
}