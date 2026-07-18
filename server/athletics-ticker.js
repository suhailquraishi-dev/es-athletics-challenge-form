const YAHOO_OLYMPICS_URL = "https://sports.yahoo.com/olympics/";
const ES_TRACK_URL = "https://www.essentiallysports.com/category/track-and-field/";
const ES_TRACK_API = "https://www.essentiallysports.com/wp-json/wp/v2/posts?search=track%20and%20field&per_page=8&_embed=1";
const FETCH_TIMEOUT_MS = 4500;

const COUNTRY_NAMES = [
  "United States", "Great Britain", "South Korea", "New Zealand", "Czech Republic",
  "Netherlands", "Switzerland", "Germany", "Norway", "France", "Sweden", "Italy",
  "Canada", "Japan", "Austria", "Australia", "China", "Finland", "Poland", "Brazil",
  "Belgium", "Spain", "Ukraine", "Denmark", "Slovenia", "Croatia", "Hungary"
];

async function handleTickerRequest({ method = "GET", fetchImpl = fetch } = {}) {
  if (String(method).toUpperCase() !== "GET") {
    return response(405, { ok: false, code: "METHOD_NOT_ALLOWED" }, { allow: "GET" });
  }

  const updatedAt = new Date().toISOString();
  try {
    const yahooResponse = await fetchWithTimeout(fetchImpl, YAHOO_OLYMPICS_URL);
    if (yahooResponse.ok) {
      const html = await yahooResponse.text();
      const items = extractMedalRows(html).slice(0, 8);
      if (items.length >= 4) {
        const finalTable = /final\s+(?:\d{4}\s+)?(?:winter\s+)?olympics medal|closing ceremony/i.test(stripTags(html)) || Date.now() >= Date.UTC(2026, 1, 23);
        return response(200, {
          ok: true,
          mode: "medals",
          label: finalTable ? "Milan 2026 / Final Medal Table" : "Olympics / Medal Table",
          status: finalTable ? "final" : "live",
          sourceName: "Yahoo Sports Olympics",
          sourceUrl: YAHOO_OLYMPICS_URL,
          updatedAt: finalTable ? "2026-02-22T23:59:59.000Z" : updatedAt,
          fallback: false,
          items
        });
      }
    }
  } catch (error) {
    // The ES headline feed below is the intentional fallback.
  }

  try {
    const esResponse = await fetchWithTimeout(fetchImpl, ES_TRACK_API);
    if (!esResponse.ok) throw new Error(`ES ticker fetch failed with ${esResponse.status}`);
    const posts = await esResponse.json();
    const items = mapHeadlinePosts(posts).slice(0, 8);
    if (!items.length) throw new Error("ES ticker returned no stories");
    return response(200, {
      ok: true,
      mode: "headlines",
      sourceName: "EssentiallySports Track and Field",
      sourceUrl: ES_TRACK_URL,
      updatedAt,
      fallback: true,
      items
    });
  } catch (error) {
    return response(503, {
      ok: false,
      code: "TICKER_UNAVAILABLE",
      updatedAt
    }, { "cache-control": "no-store" });
  }
}

async function fetchWithTimeout(fetchImpl, url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetchImpl(url, {
      headers: { "user-agent": "Mozilla/5.0 ES Athletics Challenge" },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function extractMedalRows(html) {
  const rows = [];
  const seen = new Set();
  const addRow = (country, values, position) => {
    const cleanCountry = cleanText(country);
    const numbers = values.map(Number);
    if (!cleanCountry || numbers.length !== 4 || numbers.some((value) => !Number.isFinite(value)) || seen.has(cleanCountry)) return;
    seen.add(cleanCountry);
    rows.push({ country: cleanCountry, gold: numbers[0], silver: numbers[1], bronze: numbers[2], total: numbers[3], position });
  };

  for (const match of String(html).matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map((cell) => cleanText(stripTags(cell[1])));
    const countryIndex = cells.findIndex((cell) => COUNTRY_NAMES.includes(cell));
    if (countryIndex < 0) continue;
    const values = cells.slice(countryIndex + 1).map((cell) => Number.parseInt(cell, 10)).filter(Number.isFinite).slice(0, 4);
    addRow(cells[countryIndex], values, match.index);
  }

  if (rows.length < 4) {
    const text = cleanText(stripTags(html));
    const marker = text.search(/Milan Medal Race|Country\s+G\s+S\s+B\s+Total/i);
    const section = marker >= 0 ? text.slice(marker, marker + 12000) : text;
    COUNTRY_NAMES.forEach((country) => {
      const match = new RegExp(`\\b${escapeRegExp(country)}\\b\\s+(\\d{1,3})\\s+(\\d{1,3})\\s+(\\d{1,3})\\s+(\\d{1,3})`, "i").exec(section);
      if (match) addRow(country, match.slice(1, 5), match.index);
    });
  }

  return rows.sort((first, second) => first.position - second.position).map(({ position, ...row }) => row);
}

function mapHeadlinePosts(posts) {
  if (!Array.isArray(posts)) return [];
  return posts.map((post) => {
    const url = safeEsUrl(post?.link);
    const title = cleanText(stripTags(post?.title?.rendered || ""));
    if (!url || title.length < 20) return null;
    return {
      tag: "Athletics",
      title,
      url,
      date: formatDate(post?.date)
    };
  }).filter(Boolean);
}

function safeEsUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" && (url.hostname === "essentiallysports.com" || url.hostname.endsWith(".essentiallysports.com")) ? url.href : "";
  } catch (error) {
    return "";
  }
}

function formatDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Latest";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

function cleanText(value) {
  return decodeEntities(String(value || "")).replace(/\s+/g, " ").trim();
}

function stripTags(value) {
  return String(value || "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ");
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function response(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, s-maxage=900, stale-while-revalidate=1800",
      "x-content-type-options": "nosniff",
      ...extraHeaders
    },
    body
  };
}

module.exports = {
  handleTickerRequest,
  _internal: { extractMedalRows, mapHeadlinePosts }
};
