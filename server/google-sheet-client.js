const REQUEST_TIMEOUT_MS = 8000;

async function callSheet(action, payload = {}, { env = process.env, fetchImpl = fetch } = {}) {
  const webhookUrl = env.GOOGLE_APPS_SCRIPT_URL;
  const webhookSecret = env.SHEETS_WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret) {
    const error = new Error("Sheet storage is not configured");
    error.code = "STORAGE_NOT_CONFIGURED";
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(webhookUrl, {
      method: "POST",
      redirect: "follow",
      signal: controller.signal,
      headers: { "content-type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret: webhookSecret, action, ...payload })
    });
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (error) {
      result = null;
    }
    if (!response.ok || !result?.ok) {
      const error = new Error("Sheet request failed");
      error.code = result?.code || "SHEET_REQUEST_FAILED";
      error.details = result;
      throw error;
    }
    return result;
  } catch (error) {
    if (error?.name === "AbortError") error.code = "SHEET_REQUEST_TIMEOUT";
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { callSheet };
