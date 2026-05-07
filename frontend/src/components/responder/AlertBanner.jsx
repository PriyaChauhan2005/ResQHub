import { useState } from "react";

export default function AlertBanner() {
  const [acknowledged, setAcknowledged] = useState(false);

  if (acknowledged) {
    return null;
  }

  return (
    <div className="h-10 bg-red-600 flex items-center justify-between px-6 text-sm font-semibold text-white">
      <span>
        CRITICAL SYSTEM ALERT: Severe weather warning issued for North Sector.
      </span>

      <button
        onClick={() => setAcknowledged(true)}
        className="underline text-white/80 hover:text-white"
      >
        Acknowledge
      </button>
    </div>
  );
}