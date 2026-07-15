const { callSheet } = require("../../server/google-sheet-client.js");
const { validateAndNormalizeChallenge, toPublicChallenge, cleanSlug } = require("../../server/challenge-schema.js");

module.exports = async function handler(request, response) {
  response.setHeader("x-content-type-options", "nosniff");
  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    return response.status(405).json({ ok: false, code: "METHOD_NOT_ALLOWED" });
  }

  const requested = Array.isArray(request.query?.slug) ? request.query.slug[0] : request.query?.slug;
  const slug = requested === "current" ? "current" : cleanSlug(requested);
  if (!slug) return response.status(400).json({ ok: false, code: "INVALID_CHALLENGE" });

  try {
    const stored = await callSheet("getChallenge", { slug, includeDraft: false });
    const validation = validateAndNormalizeChallenge(stored.challenge, { requireAnswers: true });
    if (!validation.ok || stored.status !== "published") {
      response.setHeader("cache-control", "no-store");
      return response.status(404).json({ ok: false, code: "CHALLENGE_NOT_FOUND" });
    }
    response.setHeader("cache-control", "public, s-maxage=60, stale-while-revalidate=300");
    return response.status(200).json({ ok: true, challenge: toPublicChallenge(validation.value) });
  } catch (error) {
    response.setHeader("cache-control", "no-store");
    const status = error.code === "CHALLENGE_NOT_FOUND" ? 404 : 503;
    return response.status(status).json({ ok: false, code: status === 404 ? "CHALLENGE_NOT_FOUND" : "CHALLENGE_UNAVAILABLE" });
  }
};
