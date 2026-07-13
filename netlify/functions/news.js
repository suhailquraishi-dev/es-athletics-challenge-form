const CATEGORY_URLS = {
  athletics: "https://www.essentiallysports.com/category/track-and-field/",
  "track-and-field": "https://www.essentiallysports.com/category/track-and-field/",
  golf: "https://www.essentiallysports.com/category/golf/",
  tennis: "https://www.essentiallysports.com/category/tennis/",
  nascar: "https://www.essentiallysports.com/category/nascar/",
  nba: "https://www.essentiallysports.com/category/nba/",
  nfl: "https://www.essentiallysports.com/category/nfl/"
};

exports.handler = async (event) => {
  const category = (event.queryStringParameters?.category || "athletics").toLowerCase();
  const mode = (event.queryStringParameters?.mode || "latest").toLowerCase();
  const url = CATEGORY_URLS[category] || CATEGORY_URLS.athletics;

  try {
    if (mode === "exclusive") {
      const stories = await fetchExclusiveStories();
      return {
        statusCode: 200,
        headers: {
          "content-type": "application/json",
          "cache-control": "public, max-age=900"
        },
        body: JSON.stringify({ source: url, stories })
      };
    }

    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 ES Athletics Challenge"
      }
    });

    if (!response.ok) {
      throw new Error(`Category fetch failed with ${response.status}`);
    }

    const html = await response.text();
    const stories = extractStories(html).slice(0, 5);

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=300"
      },
      body: JSON.stringify({ source: url, stories })
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Unable to fetch EssentiallySports category news" })
    };
  }
};

async function fetchExclusiveStories() {
  const endpoint = new URL("https://www.staging.essentiallysports.com/wp-json/wp/v2/posts");
  endpoint.searchParams.set("categories", "31241");
  endpoint.searchParams.set("search", "exclusive");
  endpoint.searchParams.set("per_page", "30");
  endpoint.searchParams.set("_embed", "1");

  const response = await fetch(endpoint, {
    headers: { "user-agent": "Mozilla/5.0 ES Athletics Challenge" }
  });
  if (!response.ok) throw new Error(`Exclusive fetch failed with ${response.status}`);

  const posts = await response.json();
  return posts
    .filter((post) => {
      const title = stripTags(post.title?.rendered || "");
      return /\bexclusive\b/i.test(title) &&
        /(track|field|olympic|athlet|enhanced games|noah lyles|usain bolt|world champion)/i.test(title);
    })
    .map((post) => ({
      tag: "Track & Field",
      title: decodeEntities(stripTags(post.title?.rendered || "EssentiallySports exclusive")),
      url: post.link,
      date: post.date,
      image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "",
      author: post._embedded?.author?.[0]?.name || "EssentiallySports",
      exclusive: true
    }))
    .slice(0, 3);
}

function extractStories(html) {
  const seen = new Set();
  const stories = [];
  const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkPattern.exec(html)) !== null) {
    const href = decodeEntities(match[1]);
    const text = stripTags(match[2]).replace(/\s+/g, " ").trim();

    if (
      !href.startsWith("https://www.essentiallysports.com/") ||
      href.includes("/category/") ||
      text.length < 35 ||
      seen.has(href)
    ) {
      continue;
    }

    seen.add(href);
    stories.push({
      title: text,
      url: href,
      date: "EssentiallySports",
      image: findNearbyImage(html, match.index)
    });
  }

  return stories;
}

function findNearbyImage(html, index) {
  const start = Math.max(0, index - 1200);
  const end = Math.min(html.length, index + 1200);
  const chunk = html.slice(start, end);
  const imageMatch = chunk.match(/https:\/\/image-cdn\.essentiallysports\.com\/[^"'\s)]+/i);
  return imageMatch ? decodeEntities(imageMatch[0]) : "";
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, "");
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&quot;/g, '"');
}
