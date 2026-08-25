/**
 * Tracam Worker — serves the built app and provides the AI location endpoint.
 *
 * POST /api/locate  { description: string }
 *   -> uses Claude (fast Haiku model) to turn a free-text description of a
 *      place into a precise geocoding query, then resolves it to coordinates
 *      via OpenStreetMap Nominatim.
 * Everything else is served from the static assets (the built Vite app).
 */

interface Env {
  ANTHROPIC_API_KEY?: string;
  ASSETS: { fetch: (req: Request) => Promise<Response> };
}

const MODEL = "claude-haiku-4-5"; // fast + inexpensive, ideal for extraction

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/locate" && request.method === "POST") {
      return handleLocate(request, env);
    }
    if (url.pathname.startsWith("/api/")) {
      return json({ error: "not_found" }, 404);
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleLocate(request: Request, env: Env): Promise<Response> {
  let description = "";
  try {
    const body = (await request.json()) as { description?: string };
    description = (body.description || "").trim();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  if (!description) return json({ error: "empty" }, 400);

  if (!env.ANTHROPIC_API_KEY) {
    return json({
      error: "no_key",
      message:
        "The AI locator isn't set up yet — add your ANTHROPIC_API_KEY in Cloudflare settings.",
    });
  }

  // 1) Ask Claude to extract a clean geocoding query from the description.
  let query = "";
  let placeLabel = "";
  let country = "";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system:
          "You turn a traveller's free-text description of somewhere they visited " +
          "into a precise place-search query for a geocoder. Prefer a named landmark, " +
          "town, and country. Always call the report_location tool.",
        tools: [
          {
            name: "report_location",
            description:
              "Report the best geocoding search query for the described place.",
            input_schema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description:
                    "A concise search string, e.g. 'Erawan Falls, Kanchanaburi, Thailand'.",
                },
                place_label: {
                  type: "string",
                  description: "A short friendly label, e.g. 'Erawan Falls'.",
                },
                country: { type: "string" },
              },
              required: ["query"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "report_location" },
        messages: [{ role: "user", content: description }],
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return json({ error: "ai_failed", message: txt.slice(0, 300) }, 502);
    }
    const data: any = await res.json();
    const tool = (data.content || []).find((b: any) => b.type === "tool_use");
    query = tool?.input?.query || "";
    placeLabel = tool?.input?.place_label || "";
    country = tool?.input?.country || "";
  } catch (err: any) {
    return json({ error: "ai_error", message: String(err).slice(0, 200) }, 502);
  }

  if (!query) return json({ error: "no_query" }, 200);

  // 2) Geocode the query with Nominatim (server-side, no key needed).
  try {
    const geoUrl =
      "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=" +
      encodeURIComponent(query);
    const geo = await fetch(geoUrl, {
      headers: { "User-Agent": "Tracam/1.0", Accept: "application/json" },
    });
    const arr: any[] = geo.ok ? await geo.json() : [];
    const results = arr.map((d) => ({
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
      label: d.display_name as string,
    }));
    return json({ query, placeLabel, country, results });
  } catch (err: any) {
    return json({ error: "geo_error", message: String(err).slice(0, 200) }, 502);
  }
}
