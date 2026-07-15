const { callSheet } = require("../../server/google-sheet-client.js");
const {
  createSessionCookie,
  verifyPassword,
  isSameOrigin,
  requestFingerprint,
  json
} = require("../../server/editor-session.js");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("allow", "POST");
    return json(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED" });
  }
  if (!isSameOrigin(request.headers)) return json(response, 403, { ok: false, code: "ORIGIN_REJECTED" });
  if (request.body?.website) return json(response, 200, { ok: true });

  try {
    const fingerprint = requestFingerprint(request.headers);
    const limit = await callSheet("consumeRateLimit", {
      rateLimit: { scope: "editor-login", key: fingerprint, limit: 10, windowSeconds: 3600 }
    });
    if (!limit.allowed) {
      response.setHeader("retry-after", String(limit.retryAfter || 3600));
      return json(response, 429, { ok: false, code: "RATE_LIMITED" });
    }
    if (!verifyPassword(request.body?.password)) {
      return json(response, 401, { ok: false, code: "INVALID_CREDENTIALS" });
    }
    response.setHeader("set-cookie", createSessionCookie());
    return json(response, 200, { ok: true, authenticated: true });
  } catch (error) {
    return json(response, 503, { ok: false, code: "EDITOR_UNAVAILABLE" });
  }
};
