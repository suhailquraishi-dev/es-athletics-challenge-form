const { handler: netlifyNewsHandler } = require("../netlify/functions/news.js");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const queryStringParameters = Object.fromEntries(
    Object.entries(request.query || {}).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  const result = await netlifyNewsHandler({ queryStringParameters });

  Object.entries(result.headers || {}).forEach(([name, value]) => response.setHeader(name, value));
  return response.status(result.statusCode).send(result.body);
};
