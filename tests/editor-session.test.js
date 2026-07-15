const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createSessionCookie,
  isAuthenticated,
  verifyPassword,
  isSameOrigin
} = require("../server/editor-session.js");

const env = {
  EDITOR_SESSION_SECRET: "session".repeat(8),
  EDITOR_ADMIN_PASSWORD: "correct horse battery staple 2026"
};

test("creates a secure HttpOnly session and verifies it", () => {
  const cookie = createSessionCookie(env);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Strict/);
  assert.equal(isAuthenticated({ cookie }, env), true);
});

test("rejects a tampered session", () => {
  const cookie = createSessionCookie(env).replace(/(__Host-es_editor=[^;]+)(.)/, (match, token, character) => (
    token.slice(0, -1) + (character === "x" ? "y" : "x")
  ));
  assert.equal(isAuthenticated({ cookie }, env), false);
});

test("compares the editor password and enforces same-origin requests", () => {
  assert.equal(verifyPassword(env.EDITOR_ADMIN_PASSWORD, env), true);
  assert.equal(verifyPassword("wrong", env), false);
  assert.equal(isSameOrigin({ origin: "https://example.com", host: "example.com" }), true);
  assert.equal(isSameOrigin({ origin: "https://attacker.example", host: "example.com" }), false);
});
