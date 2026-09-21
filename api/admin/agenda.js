/* global process */
import { requireAdmin } from "../../server/adminAuth.js";

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173,https://expertos.queesia.com")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const PHP_BASE_URL = (process.env.AGENDA_PHP_BASE_URL || "https://queesia.com/api/calendario").replace(/\/+$/, "");
const INTERNAL_TOKEN = process.env.AGENDA_INTERNAL_API_TOKEN;

const ACTIONS = {
  list: {
    method: "GET",
    phpFile: "obtener_eventos_admin.php",
  },
  create: {
    method: "POST",
    phpFile: "guardar_evento.php",
  },
  update: {
    method: "POST",
    phpFile: "actualizar_evento.php",
  },
  delete: {
    method: "POST",
    phpFile: "eliminar_evento.php",
  },
};

function setCors(req, res) {
  const origin = req.headers.origin || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : "";

  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}

function getAction(req) {
  if (req.method === "GET") return "list";
  return String(req.body?.action || "").trim().toLowerCase();
}

function getPayload(req, action) {
  if (action === "list") return null;
  if (action === "delete") {
    return { id: req.body?.id ?? req.body?.evento?.id };
  }
  if (action === "update") {
    return {
      ...(req.body?.evento || {}),
      id: req.body?.id ?? req.body?.evento?.id,
    };
  }
  return req.body?.evento || {};
}

async function callPhp(action, payload) {
  const config = ACTIONS[action];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${PHP_BASE_URL}/${config.phpFile}`, {
      method: config.method,
      headers: {
        "Content-Type": "application/json",
        "X-Agenda-Internal-Token": INTERNAL_TOKEN,
      },
      ...(config.method === "POST" ? { body: JSON.stringify(payload || {}) } : {}),
      signal: controller.signal,
    });

    const text = await response.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      console.error("Agenda PHP non-JSON response:", {
        action,
        status: response.status,
        body: text.slice(0, 500),
        error: error?.message,
      });
      return {
        status: 502,
        data: {
          success: false,
          message: "Error interno del servidor",
        },
      };
    }

    return {
      status: response.status,
      data,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return sendJson(res, 405, {
      success: false,
      message: "Método no permitido",
    });
  }

  const origin = req.headers.origin || "";
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return sendJson(res, 403, {
      success: false,
      message: "No autorizado",
    });
  }

  try {
    await requireAdmin(req);
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      return sendJson(res, error.status, {
        success: false,
        message: error.message,
      });
    }

    console.error("Agenda auth error:", error);
    return sendJson(res, 500, {
      success: false,
      message: "Error interno del servidor",
    });
  }

  if (!INTERNAL_TOKEN) {
    console.error("Missing AGENDA_INTERNAL_API_TOKEN");
    return sendJson(res, 500, {
      success: false,
      message: "Error interno del servidor",
    });
  }

  const action = getAction(req);
  const config = ACTIONS[action];

  if (!config) {
    return sendJson(res, 400, {
      success: false,
      message: "Acción inválida",
    });
  }

  try {
    const payload = getPayload(req, action);
    const phpResponse = await callPhp(action, payload);

    return sendJson(res, phpResponse.status, phpResponse.data);
  } catch (error) {
    console.error("Agenda proxy error:", {
      message: error?.message,
      name: error?.name,
    });

    return sendJson(res, 500, {
      success: false,
      message: "Error interno del servidor",
    });
  }
}
