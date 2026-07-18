const { handleTickerRequest } = require("../server/athletics-ticker.js");

module.exports = async function handler(request, response) {
  const result = await handleTickerRequest({ method: request.method, fetchImpl: fetch });
  Object.entries(result.headers || {}).forEach(([name, value]) => response.setHeader(name, value));
  response.status(result.statusCode);
  if (result.body === null) return response.end();
  return response.json(result.body);
};
