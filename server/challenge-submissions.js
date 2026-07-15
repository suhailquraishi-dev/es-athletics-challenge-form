const { randomUUID } = require("node:crypto");

const MAX_BODY_BYTES = 64 * 1024;
const MAX_ANSWERS = 50;
const REQUEST_TIMEOUT_MS = 8000;

async function handleSubmissionRequest({ method, body, headers = {}, env = process.env, fetchImpl = fetch }) {
  const requestMethod = String(method || "GET").toUpperCase();
  if (requestMethod === "OPTIONS") {
    return response(204, null, { allow: "POST, OPTIONS" });
  }

  if (requestMethod !== "POST") {
    return response(405, { ok: false, code: "METHOD_NOT_ALLOWED" }, { allow: "POST, OPTIONS" });
  }

  const rawBody = normalizeBody(body);
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return response(413, { ok: false, code: "PAYLOAD_TOO_LARGE" });
  }

  let payload;
  try {
    payload = typeof body === "object" && body !== null && !Buffer.isBuffer(body)
      ? body
      : JSON.parse(rawBody || "{}");
  } catch (error) {
    return response(400, { ok: false, code: "INVALID_JSON" });
  }

  const validation = validatePayload(payload);
  if (!validation.ok) {
    return response(400, { ok: false, code: "INVALID_SUBMISSION", fields: validation.fields });
  }

  const webhookUrl = env.GOOGLE_APPS_SCRIPT_URL;
  const webhookSecret = env.SHEETS_WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret) {
    return response(503, { ok: false, code: "STORAGE_NOT_CONFIGURED" });
  }

  const submission = {
    submissionId: randomUUID(),
    submittedAt: new Date().toISOString(),
    ...validation.value,
    sourceUrl: cleanText(payload.sourceUrl, 1000),
    userAgent: cleanText(getHeader(headers, "user-agent"), 500)
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const sheetResponse = await fetchImpl(webhookUrl, {
      method: "POST",
      redirect: "follow",
      signal: controller.signal,
      headers: { "content-type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret: webhookSecret, submission })
    });
    const sheetResult = await readJsonResponse(sheetResponse);

    if (!sheetResponse.ok || !sheetResult?.ok) {
      return response(502, { ok: false, code: "SHEET_WRITE_FAILED" });
    }

    return response(sheetResult.duplicate ? 200 : 201, {
      ok: true,
      duplicate: Boolean(sheetResult.duplicate),
      submissionId: sheetResult.submissionId || submission.submissionId,
      score: finiteOrFallback(sheetResult.score, submission.score),
      totalPoints: finiteOrFallback(sheetResult.totalPoints, submission.totalPoints)
    });
  } catch (error) {
    const code = error?.name === "AbortError" ? "SHEET_WRITE_TIMEOUT" : "SHEET_WRITE_FAILED";
    return response(502, { ok: false, code });
  } finally {
    clearTimeout(timeout);
  }
}

function validatePayload(payload) {
  const fields = [];
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, fields: ["payload"] };
  }

  if (payload.website) fields.push("website");

  const email = cleanText(payload.email, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.push("email");

  const challenge = payload.challenge && typeof payload.challenge === "object" ? payload.challenge : {};
  const challengeId = cleanIdentifier(challenge.id, 100);
  const challengeTitle = cleanText(challenge.title, 200);
  const category = cleanText(challenge.category, 100);
  if (!challengeId) fields.push("challenge.id");
  if (!challengeTitle) fields.push("challenge.title");
  if (!category) fields.push("challenge.category");

  const score = Number(payload.score);
  const totalPoints = Number(payload.totalPoints);
  if (!Number.isFinite(score) || score < 0) fields.push("score");
  if (!Number.isFinite(totalPoints) || totalPoints <= 0 || totalPoints > 10000) fields.push("totalPoints");
  if (Number.isFinite(score) && Number.isFinite(totalPoints) && score > totalPoints) fields.push("score");

  const rawAnswers = Array.isArray(payload.answers) ? payload.answers : [];
  if (!rawAnswers.length || rawAnswers.length > MAX_ANSWERS) fields.push("answers");
  const answers = rawAnswers.slice(0, MAX_ANSWERS).map((answer, index) => {
    const source = answer && typeof answer === "object" ? answer : {};
    const id = cleanIdentifier(source.id, 100);
    const title = cleanText(source.title, 300);
    if (!id) fields.push(`answers.${index}.id`);
    if (!title) fields.push(`answers.${index}.title`);
    return {
      id,
      title,
      type: cleanIdentifier(source.type, 40),
      value: normalizeAnswerValue(source.value)
    };
  });

  if (fields.length) return { ok: false, fields: [...new Set(fields)] };

  return {
    ok: true,
    value: {
      email,
      challengeId,
      challengeTitle,
      category,
      score: Math.round(score * 100) / 100,
      totalPoints: Math.round(totalPoints * 100) / 100,
      answers
    }
  };
}

function normalizeAnswerValue(value) {
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => cleanText(item, 500));
  }
  return cleanText(value, 2000);
}

function cleanIdentifier(value, limit) {
  return cleanText(value, limit).replace(/[^a-zA-Z0-9_-]/g, "");
}

function cleanText(value, limit) {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, limit);
}

function normalizeBody(body) {
  if (Buffer.isBuffer(body)) return body.toString("utf8");
  if (typeof body === "string") return body;
  return JSON.stringify(body || {});
}

function getHeader(headers, name) {
  const match = Object.keys(headers || {}).find((key) => key.toLowerCase() === name.toLowerCase());
  const value = match ? headers[match] : "";
  return Array.isArray(value) ? value.join(", ") : value;
}

function finiteOrFallback(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

async function readJsonResponse(sheetResponse) {
  const text = await sheetResponse.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function response(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders
    },
    body
  };
}

module.exports = {
  handleSubmissionRequest,
  _internal: { validatePayload, normalizeAnswerValue, cleanIdentifier }
};
