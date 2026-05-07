const Incident = require("../models/Incident");
const User = require("../models/User");

const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, createHttpError } = require("../utils/apiResponse");
const { getIO } = require("../utils/socket");

const emitIncidentEvent = (eventName, incident) => {
  const io = getIO();
  if (io) {
    io.emit(eventName, incident);
  }
};

const assertValidResponder = async (responderId) => {
  const responder = await User.findById(responderId);
  if (!responder || responder.role !== "responder") {
    throw createHttpError(400, "Responder not found or invalid role.");
  }
  return responder;
};

const createIncident = asyncHandler(async (req, res) => {
  const { title, description, severity, location } = req.body;

  // 🔐 BASIC VALIDATION
  if (!title || !severity || !location) {
    throw createHttpError(400, "Title, severity and location are required.");
  }

  if (severity === "HIGH" && !description) {
  throw createHttpError(400, "Description is required for high severity incidents.");
}

const finalDescription = description || "No additional details provided";

  if (
    typeof location.lat !== "number" ||
    typeof location.lng !== "number"
  ) {
    throw createHttpError(400, "Invalid location coordinates.");
  }

  const existing = await Incident.findOne({
    title,
    "location.lat": location.lat,
    "location.lng": location.lng,
    createdAt: {
      $gte: new Date(Date.now() - 10 * 60 * 1000),
    },
  });

  if (existing) {
    throw createHttpError(400, "Similar incident already reported recently.");
  }

  const incident = await Incident.create({
    title,
    description : finalDescription,
    severity,
    location,
    status: "PENDING",
    createdBy: req.user.id,
    assignedTo: null,
  });

  const populated = await Incident.findById(incident._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  emitIncidentEvent("incident:created", populated);

  return sendSuccess(res, "Incident created successfully.", populated, 201);
});

const getIncidents = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "victim") {
    filter.createdBy = req.user.id;
  }

  if (req.user.role === "responder" && req.query.mine === "true") {
    filter.assignedTo = req.user.id;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const incidents = await Incident.find(filter)
    .sort({ createdAt: -1 })
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  return sendSuccess(res, "Incidents fetched successfully.", incidents);
});

const assignIncident = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { responderId } = req.body;

  if (req.user.role !== "admin") {
    throw createHttpError(403, "Only admin can assign incidents.");
  }

  const incident = await Incident.findById(id);
  if (!incident) {
    throw createHttpError(404, "Incident not found.");
  }

  if (incident.status !== "PENDING") {
    throw createHttpError(409, "Only PENDING incidents can be assigned.");
  }

  // responders are assigned by admins only (backend enforces this above)

  await assertValidResponder(responderId);

  incident.assignedTo = responderId;
  incident.status = "ASSIGNED";
  await incident.save();

  const populated = await Incident.findById(incident._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  emitIncidentEvent("incident:assigned", populated);

  return sendSuccess(res, "Incident assigned successfully.", populated);
});

const resolveIncident = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "responder") {
    throw createHttpError(403, "You do not have permission to resolve incidents.");
  }

  const incident = await Incident.findById(id);
  if (!incident) {
    throw createHttpError(404, "Incident not found.");
  }

  if (incident.status !== "ASSIGNED") {
    throw createHttpError(409, "Only ASSIGNED incidents can be resolved.");
  }

  if (
    req.user.role === "responder" &&
    incident.assignedTo &&
    incident.assignedTo.toString() !== req.user.id
  ) {
    throw createHttpError(403, "Responder can resolve only assigned incidents.");
  }

  if (!incident.assignedTo) {
    throw createHttpError(409, "Incident must be assigned before resolving.");
  }

  incident.status = "RESOLVED";
  await incident.save();

  const populated = await Incident.findById(incident._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  emitIncidentEvent("incident:resolved", populated);

  return sendSuccess(res, "Incident resolved successfully.", populated);
});

const reassignIncident = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { responderId } = req.body;

  const incident = await Incident.findById(id);
  if (!incident) {
    throw createHttpError(404, "Incident not found.");
  }

  if (incident.status === "RESOLVED") {
    throw createHttpError(409, "Resolved incidents cannot be reassigned.");
  }

  await assertValidResponder(responderId);

  incident.assignedTo = responderId;
  incident.status = "ASSIGNED";
  await incident.save();

  const populated = await Incident.findById(incident._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  emitIncidentEvent("incident:reassigned", populated);

  return sendSuccess(res, "Incident reassigned successfully.", populated);
});

const deleteIncident = asyncHandler(async (req, res) => {
  const incident = await Incident.findByIdAndDelete(req.params.id);

  if (!incident) {
    throw createHttpError(404, "Incident not found.");
  }

  emitIncidentEvent("incident:deleted", { id: incident._id.toString() });

  return sendSuccess(res, "Incident deleted successfully.");
});

const getEscalatedIncidents = asyncHandler(async (req, res) => {
  const escalationThresholdMs = 10 * 60 * 1000;
  const thresholdDate = new Date(Date.now() - escalationThresholdMs);

  const escalated = await Incident.find({
    status: "PENDING",
    createdAt: { $lte: thresholdDate },
  })
    .sort({ createdAt: 1 })
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  return sendSuccess(res, "Escalated incidents fetched successfully.", escalated);
});

const syncIncidents = asyncHandler(async (req, res) => {
  const { incidents } = req.body;

  if (!Array.isArray(incidents)) {
    throw createHttpError(400, "incidents must be an array.");
  }

  const created = [];

  for (const item of incidents) {
    if (
      !item.title ||
      !item.description ||
      !item.severity ||
      !item.location ||
      typeof item.location.lat !== "number" ||
      typeof item.location.lng !== "number"
    ) {
      // Skip malformed items instead of failing full sync.
      continue;
    }

    const incident = await Incident.create({
      title: item.title,
      description: item.description,
      severity: item.severity,
      location: item.location,
      status: "PENDING",
      createdBy: req.user.id,
      assignedTo: null,
    });

    created.push(incident);
    emitIncidentEvent("incident:created", incident);
  }

  return sendSuccess(res, "Offline incidents synced.", { createdCount: created.length }, 201);
});

const patchIncident = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, assignedTo } = req.body;

  const incident = await Incident.findById(id);
  if (!incident) {
    throw createHttpError(404, "Incident not found.");
  }

  const canAssign = req.user.role === "admin";
  const canResolve = req.user.role === "responder";

  if (status === "ASSIGNED") {
    if (!canAssign) {
      throw createHttpError(403, "You do not have permission to assign incidents.");
    }

    if (incident.status !== "PENDING") {
      throw createHttpError(409, "Only PENDING incidents can be assigned.");
    }

    if (typeof assignedTo !== "string" || assignedTo.trim().length === 0) {
      throw createHttpError(400, "assignedTo is required when assigning.");
    }

    // Frontend provides responder name; allow also direct ObjectId assignment.
    let responder = null;
    if (/^[a-fA-F0-9]{24}$/.test(assignedTo)) {
      responder = await User.findById(assignedTo);
    } else {
      responder = await User.findOne({ name: assignedTo, role: "responder" });
    }

    if (!responder || responder.role !== "responder") {
      throw createHttpError(400, "Responder not found or invalid role.");
    }

    if (req.user.role === "responder" && responder._id.toString() !== req.user.id) {
      throw createHttpError(403, "Responder can only assign incidents to self.");
    }

    incident.assignedTo = responder._id;
    incident.status = "ASSIGNED";
    await incident.save();

    const populated = await Incident.findById(incident._id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    emitIncidentEvent("incident:assigned", populated);
    return sendSuccess(res, "Incident assigned successfully.", populated);
  }

  if (status === "RESOLVED") {
    if (!canResolve) {
      throw createHttpError(403, "You do not have permission to resolve incidents.");
    }

    if (incident.status !== "ASSIGNED") {
      throw createHttpError(409, "Only ASSIGNED incidents can be resolved.");
    }

    if (!incident.assignedTo) {
      throw createHttpError(409, "Incident must be assigned before resolving.");
    }

    if (req.user.role === "responder") {
      if (incident.assignedTo.toString() !== req.user.id) {
        throw createHttpError(403, "Responder can resolve only assigned incidents.");
      }
    }

    incident.status = "RESOLVED";
    await incident.save();

    const populated = await Incident.findById(incident._id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    emitIncidentEvent("incident:resolved", populated);
    return sendSuccess(res, "Incident resolved successfully.", populated);
  }

  // PENDING updates are intentionally not supported via the generic PATCH endpoint.
  // This prevents invalid/ambiguous transitions that would break analytics assumptions.
  throw createHttpError(409, "Invalid incident transition.");
});

module.exports = {
  createIncident,
  getIncidents,
  assignIncident,
  resolveIncident,
  reassignIncident,
  deleteIncident,
  getEscalatedIncidents,
  syncIncidents,
  patchIncident,
};