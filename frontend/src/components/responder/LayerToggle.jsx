import { useState } from "react";

export default function LayerToggle() {
  const [activeLayer, setActiveLayer] = useState("Traffic");

  const layerButtonClass = (name) =>
    `px-3 py-1 rounded-full text-xs ${
      activeLayer === name
        ? "bg-blue-600 text-white"
        : "bg-[#0b1420] text-slate-400"
    }`;

  return (
    <div className="absolute top-6 right-6 bg-[#162435]/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl shadow-blue-500/10 z-[1000] space-y-3">

      <p className="text-xs text-slate-400 font-semibold uppercase">
        Layer Toggle
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveLayer("Traffic")}
          className={layerButtonClass("Traffic")}
        >
          Traffic
        </button>
        <button
          onClick={() => setActiveLayer("Hydrants")}
          className={layerButtonClass("Hydrants")}
        >
          Hydrants
        </button>
        <button
          onClick={() => setActiveLayer("CCTV")}
          className={layerButtonClass("CCTV")}
        >
          CCTV
        </button>
      </div>

    </div>
  );
}