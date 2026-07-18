const test = require("node:test");
const assert = require("node:assert/strict");
const { handleTickerRequest, _internal } = require("../server/athletics-ticker.js");

test("extracts ordered medal rows from a Yahoo-style table", () => {
  const html = `
    <h2>Milan Medal Race</h2>
    <table><tr><th>Country</th><th>G</th><th>S</th><th>B</th><th>Total</th></tr>
      <tr><td>Norway</td><td>18</td><td>12</td><td>11</td><td>41</td></tr>
      <tr><td>United States</td><td>12</td><td>12</td><td>9</td><td>33</td></tr>
      <tr><td>Netherlands</td><td>10</td><td>7</td><td>3</td><td>20</td></tr>
      <tr><td>Italy</td><td>10</td><td>6</td><td>14</td><td>30</td></tr>
    </table>`;

  assert.deepEqual(_internal.extractMedalRows(html), [
    { country: "Norway", gold: 18, silver: 12, bronze: 11, total: 41 },
    { country: "United States", gold: 12, silver: 12, bronze: 9, total: 33 },
    { country: "Netherlands", gold: 10, silver: 7, bronze: 3, total: 20 },
    { country: "Italy", gold: 10, silver: 6, bronze: 14, total: 30 }
  ]);
});

test("returns medal data with cache and source metadata", async () => {
  const html = `Milan Medal Race Country G S B Total Norway 18 12 11 41 United States 12 12 9 33 Netherlands 10 7 3 20 Italy 10 6 14 30`;
  const result = await handleTickerRequest({
    fetchImpl: async () => ({ ok: true, text: async () => html })
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.mode, "medals");
  assert.equal(result.body.status, "final");
  assert.equal(result.body.label, "Milan 2026 / Final Medal Table");
  assert.equal(result.body.sourceName, "Yahoo Sports Olympics");
  assert.equal(result.body.items.length, 4);
  assert.match(result.headers["cache-control"], /s-maxage=900/);
});

test("falls back to current ES headlines when medals are unavailable", async () => {
  const responses = [
    { ok: true, text: async () => "No medal table here" },
    {
      ok: true,
      json: async () => [{
        link: "https://www.essentiallysports.com/olympics-news-track-and-field-example-story/",
        title: { rendered: "Track and Field Champion Announces a Major Return" },
        date: "2026-07-18T08:00:00"
      }]
    }
  ];
  const result = await handleTickerRequest({ fetchImpl: async () => responses.shift() });

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.mode, "headlines");
  assert.equal(result.body.fallback, true);
  assert.equal(result.body.items[0].tag, "Athletics");
});

test("returns an honest unavailable state when both sources fail", async () => {
  const result = await handleTickerRequest({
    fetchImpl: async () => { throw new Error("offline"); }
  });
  assert.equal(result.statusCode, 503);
  assert.equal(result.body.code, "TICKER_UNAVAILABLE");
  assert.equal(result.headers["cache-control"], "no-store");
});
