const { clearSessionCookie, isSameOrigin, json } = require("../../server/editor-session.js");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("allow", "POST");
    return json(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED" });
  }
  if (!isSameOrigin(request.headers)) return json(response, 403, { ok: false, code: "ORIGIN_REJECTED" });
  response.setHeader("set-cookie", clearSessionCookie());
  return json(response, 200, { ok: true, authenticated: false });
};
