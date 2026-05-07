import { useIncidents } from "../../context/IncidentContext";

export default function Topbar() {

  const { addIncident, requesting } = useIncidents();
  const handleSOS = async () => {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // SOUND
  const alarmSound = new Audio("/alarm.mp3");
  alarmSound.play().catch(() => {});

  // VIBRATION
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }

  const createSOSIncident = async (lat, lng) => {
  const created = await addIncident({
    id: Date.now(),
    title: "SOS Emergency",
    description: "Auto-generated SOS alert",
    severity: "HIGH",
    location: lat && lng
      ? { lat, lng }
      : { manual: "Location unavailable" },
    status: "PENDING",
  });
  return created;
};

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        createSOSIncident(
        pos.coords.latitude,
        pos.coords.longitude
  );

        if (isMobile) {
          window.location.href = "tel:112";
        } else {
          alert("🚨 SOS triggered! Call works on mobile.");
        }
      },
      () => {
        createSOSIncident();

        if (isMobile) {
          window.location.href = "tel:112";
        } else {
          alert("🚨 SOS triggered without location.");
        }
      }
    );
  } else {
    createSOSIncident();

    if (isMobile) {
      window.location.href = "tel:112";
    } else {
      alert("🚨 SOS triggered.");
    }
  }
};

  return (
    <header className="h-20 border-b border-blue-500/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8">
      
      <div>
        <h1 className="text-xl font-bold">Victim Portal</h1>
        <p className="text-sm text-slate-400">
          Stay calm. Help is a click away.
        </p>
      </div>

      <button
       onClick={handleSOS}
       disabled={requesting}
       className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold shadow-lg disabled:opacity-60"
      >
       {requesting ? "Loading..." : "SOS CALL"}
      </button>

    </header>
  );
}