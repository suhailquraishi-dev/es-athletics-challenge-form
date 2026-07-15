const { createHmac, timingSafeEqual, randomBytes } = require("node:crypto");

const COOKIE_NAME = "__Host-es_editor";
const SESSION_SECONDS = 8 * 60 * 60;

function createSessionCookie(env = process.env) {
  const secret = requireSecret(env.EDITOR_SESSION_SECRET);
  const now = Math.floor(Date.now() / 1000);
  const payload = encode({ iat: now, exp: now + SESSION_SECONDS, nonce: randomBytes(12).toString("base64url") });
  const token = `${payload}.${sign(payload, secret)}`;
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

function isAuthenticated(headers, env = process.env) {
  try {
    const secret = requireSecret(env.EDITOR_SESSION_SECRET);
    const token = parseCookies(getHeader(headers, "cookie"))[COOKIE_NAME];
    if (!token) return false;
    const [payload, signature] = token.split(".");
    if (!payload || !signature || !safeEqual(signature, sign(payload, secret))) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number(data.exp) > Math.floor(Date.now() / 1000);
  } catch (error) {
    return false;
  }
}

function verifyPassword(value, env = process.env) {
  const expected = requireSecret(env.EDITOR_ADMIN_PASSWORD);
  return safeEqual(String(value || ""), expected);
}

function isSameOrigin(headers) {
  const origin = getHeader(headers, "origin");
  const host = getHeader(headers, "x-forwarded-host") || getHeader(headers, "host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === String(host).split(",")[0].trim();
  } catch (error) {
    return false;
  }
}

function requestFingerprint(headers, env = process.env) {
  const secret = env.ABUSE_HASH_SECRET || env.EDITOR_SESSION_SECRET || env.SHEETS_WEBHOOK_SECRET;
  const forwarded = getHeader(headers, "x-forwarded-for").split(",")[0].trim();
  const ip = forwarded || getHeader(headers, "x-real-ip") || "unknown";
  return createHmac("sha256", requireSecret(secret)).update(ip).digest("hex").slice(0, 32);
}

function json(response, status, body) {
  response.setHeader("cache-control", "no-store");
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("x-content-type-options", "nosniff");
  return response.status(status).json(body);
}

function parseCookies(value) {
  return String(value || "").split(";").reduce((cookies, part) => {
    const index = part.indexOf("=");
    if (index > 0) cookies[part.slice(0, index).trim()] = part.slice(index + 1).trim();
    return cookies;
  }, {});
}

function getHeader(headers, name) {
  const match = Object.keys(headers || {}).find((key) => key.toLowerCase() === name.toLowerCase());
  const value = match ? headers[match] : "";
  return Array.isArray(value) ? value.join(", ") : String(value || "");
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(value, secret) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function requireSecret(value) {
  if (!value || String(value).length < 32) throw new Error("Required server secret is missing");
  return String(value);
}

module.exports = {
  createSessionCookie,
  clearSessionCookie,
  isAuthenticated,
  verifyPassword,
  isSameOrigin,
  requestFingerprint,
  json
};
