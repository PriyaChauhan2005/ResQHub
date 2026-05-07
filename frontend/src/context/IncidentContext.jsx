/* eslint react-refresh/only-export-components: off */
import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../utils/api";

const IncidentContext = createContext();

const normalizeIncident = (incident) => {
  if (!incident) return null;

  const assigned = incident.assignedTo;

  return {
    ...incident,
    id: incident.id || incident._id,
    assignedTo:
      typeof assigned === "object"
        ? assigned?.name || assigned?._id || null
        : assigned || null,
    createdAt: incident.createdAt || new Date().toISOString(),
    updatedAt: incident.updatedAt || incident.createdAt || new Date().toISOString(),
  };
};

export function IncidentProvider({ children }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requesting, setRequesting] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "null"
      );
      const isResponder = currentUser?.role === "responder";

      const path = isResponder ? "/incidents?mine=true" : "/incidents";
      const payload = await apiRequest(path, { method: "GET" });
      const serverIncidents = Array.isArray(payload?.data) ? payload.data : [];
      setIncidents(serverIncidents.map(normalizeIncident));
    } catch (err) {
      setError(err.message || "Failed to fetch incidents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const addIncident = async (incident) => {
    setRequesting(true);
    setError(null);

    const fallbackLocation = { lat: 28.6139, lng: 77.209 };
    const incomingLocation = incident?.location;

    const location =
      incomingLocation &&
      typeof incomingLocation.lat === "number" &&
      typeof incomingLocation.lng === "number"
        ? incomingLocation
        : fallbackLocation;

    const body = {
      title: incident?.title || "Emergency Alert",
      description: incident?.description || "Emergency incident reported.",
      severity: incident?.severity || "MEDIUM",
      location,
    };

    try {
      const payload = await apiRequest("/incidents", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const created = normalizeIncident(payload?.data);
      if (created) {
        setIncidents((prev) => [created, ...prev]);
      }
      return created;
    } catch (err) {
      setError(err.message || "Failed to create incident.");
      return null;
    } finally {
      setRequesting(false);
    }
  };

  const updateStatus = async (id, newStatus, responderName = null) => {
    setRequesting(true);
    setError(null);

    try {
      const payload = await apiRequest(`/incidents/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
          assignedTo: responderName,
        }),
      });

      const updated = normalizeIncident(payload?.data);
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? { ...inc, ...updated } : inc))
      );
      return updated;
    } catch (err) {
      setError(err.message || "Failed to update incident.");
      return null;
    } finally {
      setRequesting(false);
    }
  };

  const overrideAssign = async (id, responderName) => {
    setRequesting(true);
    setError(null);

    try {
      // Admin reassigns to a responder (keeps status ASSIGNED).
      const payload = await apiRequest(`/incidents/${id}/reassign`, {
        method: "PATCH",
        body: JSON.stringify({
          responderId: responderName,
        }),
      });

      const updated = normalizeIncident(payload?.data);
      if (updated) {
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === id ? { ...inc, ...updated } : inc))
        );
      }
      return updated;
    } catch (err) {
      setError(err.message || "Failed to reassign incident.");
      return null;
    } finally {
      setRequesting(false);
    }
  };

  const removeIncident = (id) => {
    setIncidents((prev) => prev.filter((inc) => inc.id !== id));
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        loading,
        requesting,
        error,
        refreshIncidents: fetchIncidents,
        addIncident,
        updateStatus,
        overrideAssign,
        removeIncident,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  return useContext(IncidentContext);
}