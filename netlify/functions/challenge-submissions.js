const { handleSubmissionRequest, _internal } = require("../../server/challenge-submissions.js");

exports.handler = async (event) => {
  const body = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : event.body || "";
  const result = await handleSubmissionRequest({
    method: event.httpMethod,
    body,
    headers: event.headers,
    env: process.env
  });

  return {
    statusCode: result.statusCode,
    headers: result.headers,
    body: result.body === null ? "" : JSON.stringify(result.body)
  };
};

exports._internal = _internal;
