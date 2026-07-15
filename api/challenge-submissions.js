const { handleSubmissionRequest } = require("../server/challenge-submissions.js");

module.exports = async function handler(request, response) {
  const result = await handleSubmissionRequest({
    method: request.method,
    body: request.body,
    headers: request.headers,
    env: process.env
  });

  Object.entries(result.headers).forEach(([name, value]) => response.setHeader(name, value));
  response.status(result.statusCode);
  if (result.body === null) return response.end();
  return response.json(result.body);
};
