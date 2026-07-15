const { callSheet } = require("../../server/google-sheet-client.js");
const { isAuthenticated, isSameOrigin, json } = require("../../server/editor-session.js");
const { validateAndNormalizeChallenge, cleanSlug } = require("../../server/challenge-schema.js");

module.exports = async function handler(request, response) {
  if (!isAuthenticated(request.headers)) return json(response, 401, { ok: false, code: "AUTH_REQUIRED" });

  if (request.method === "GET") {
    try {
      const requested = Array.isArray(request.query?.slug) ? request.query.slug[0] : request.query?.slug;
      if (requested) {
        const slug = requested === "current" ? "current" : cleanSlug(requested);
        if (!slug) return json(response, 400, { ok: false, code: "INVALID_CHALLENGE" });
        const result = await callSheet("getChallenge", { slug, includeDraft: true });
        return json(response, 200, result);
      }
      const result = await callSheet("listChallenges");
      return json(response, 200, result);
    } catch (error) {
      const status = error.code === "CHALLENGE_NOT_FOUND" ? 404 : 503;
      return json(response, status, { ok: false, code: status === 404 ? "CHALLENGE_NOT_FOUND" : "EDITOR_STORAGE_FAILED" });
    }
  }

  if (request.method === "POST") {
    if (!isSameOrigin(request.headers) || request.headers["x-es-editor-request"] !== "1") {
      return json(response, 403, { ok: false, code: "REQUEST_REJECTED" });
    }
    const action = request.body?.action === "publish" ? "publishChallenge" : "saveChallenge";
    const validation = validateAndNormalizeChallenge(request.body?.challenge, { requireAnswers: true });
    if (!validation.ok) {
      return json(response, 400, { ok: false, code: "INVALID_CHALLENGE", fields: validation.errors });
    }
    try {
      const result = await callSheet(action, { challenge: validation.value });
      return json(response, 200, result);
    } catch (error) {
      if (error.code === "RESPONSE_SCHEMA_LOCKED" || error.code === "PUBLISHED_CHALLENGE_LOCKED") {
        return json(response, 409, { ok: false, code: error.code });
      }
      return json(response, 503, { ok: false, code: "EDITOR_STORAGE_FAILED" });
    }
  }

  response.setHeader("allow", "GET, POST");
  return json(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED" });
};
