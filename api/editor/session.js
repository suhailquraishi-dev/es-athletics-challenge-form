const { isAuthenticated, json } = require("../../server/editor-session.js");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    return json(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED" });
  }
  return json(response, 200, { ok: true, authenticated: isAuthenticated(request.headers) });
};
