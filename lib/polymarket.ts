import { Market, MarketCategory, PolymarketMarket } from "./types";
import {
  POLYMARKET_GAMMA_URL,
  CATEGORY_KEYWORDS,
  MIN_VOLUME,
} from "./constants";

// ── In-memory cache ───────────────────────────────────────────
let marketCache: { data: Market[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── Category detection ────────────────────────────────────────
export function detectCategory(question: string): MarketCategory {
  const q = question.toLowerCase();
  const orderedCategories: (Exclude<MarketCategory, "Other">)[] = [
    "NBA", "NFL", "Sports", "Crypto", "Politics",
    "Economy", "Entertainment", "Tech",
  ];
  for (const category of orderedCategories) {
    const keywords = CATEGORY_KEYWORDS[category];
    for (const keyword of keywords) {
      if (q.includes(keyword.toLowerCase())) return category;
    }
  }
  return "Other";
}

// ── Normalize Polymarket data ─────────────────────────────────
function normalizeMarket(raw: PolymarketMarket): Market | null {
  // Gamma API uses camelCase; guard both casings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  const conditionId: string =
    r.conditionId || r.condition_id || r.id || "";

  if (!conditionId) {
    console.warn("[Polymarket] Market missing conditionId, skipping:", r.question);
    return null;
  }

  // Parse prices — use outcome_prices / outcomePrices or first token price
  let marketProb = 50;
  const outcomePrices = r.outcomePrices || r.outcome_prices;
  if (outcomePrices) {
    try {
      const prices = JSON.parse(outcomePrices);
      if (Array.isArray(prices) && prices.length > 0) {
        marketProb = Math.round(parseFloat(prices[0]) * 100);
      }
    } catch { /* fallback to tokens */ }
  }

  const tokens = r.tokens || [];
  if (marketProb === 50 && tokens.length > 0) {
    const yesToken = tokens.find(
      (t: { outcome?: string; price: number }) =>
        t.outcome?.toLowerCase() === "yes"
    );
    if (yesToken) {
      marketProb = Math.round(yesToken.price * 100);
    } else {
      marketProb = Math.round(tokens[0].price * 100);
    }
  }

  const volume = r.volumeNum || r.volume_num || r.volume || 0;

  if (volume < MIN_VOLUME) return null;
  if (r.closed) return null;

  const question: string = r.question || "";
  const category = detectCategory(question);
  const slug: string = r.marketSlug || r.market_slug || conditionId;

  return {
    id: conditionId,
    source: "polymarket",
    question,
    category,
    marketProb,
    volume,
    endDate: r.endDateIso || r.end_date_iso || r.gameStartTime || r.game_start_time || "",
    url: `https://polymarket.com/event/${slug}`,
    rawData: raw as unknown as Record<string, unknown>,
  };
}

// ── Fetch markets ─────────────────────────────────────────────
export async function fetchMarkets(
  options: {
    category?: MarketCategory;
    limit?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<Market[]> {
  const { category, limit = 200, forceRefresh = false } = options;

  if (
    !forceRefresh &&
    marketCache &&
    Date.now() - marketCache.timestamp < CACHE_TTL
  ) {
    let markets = marketCache.data;
    if (category && category !== "Other") {
      markets = markets.filter((m) => m.category === category);
    }
    return markets.slice(0, limit);
  }

  const allMarkets: Market[] = [];
  let cursor: string | undefined;
  let pages = 0;
  const maxPages = 5;

  while (pages < maxPages) {
    const url = new URL(`${POLYMARKET_GAMMA_URL}/markets`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("active", "true");
    url.searchParams.set("closed", "false");
    url.searchParams.set("order", "volume");
    url.searchParams.set("ascending", "false");
    if (cursor) url.searchParams.set("next_cursor", cursor);

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(`Polymarket API error: ${res.status} ${res.statusText}`);
      break;
    }

    const data = await res.json();

    // Log first market keys once to help diagnose field naming
    if (pages === 0) {
      const sample = Array.isArray(data) ? data[0] : (data.data || [])[0];
      if (sample) {
        console.log("[Polymarket] Sample market keys:", Object.keys(sample).join(", "));
      }
    }

    const rawMarkets: PolymarketMarket[] = Array.isArray(data)
      ? data
      : data.data || [];

    if (rawMarkets.length === 0) break;

    for (const raw of rawMarkets) {
      const market = normalizeMarket(raw);
      if (market) allMarkets.push(market);
    }

    cursor = data.next_cursor;
    if (!cursor) break;
    pages++;
  }

  marketCache = { data: allMarkets, timestamp: Date.now() };
  let filtered = allMarkets;
  if (category && category !== "Other") {
    filtered = filtered.filter((m) => m.category === category);
  }
  return filtered.slice(0, limit);
}

// ── Fetch single market ───────────────────────────────────────
export async function fetchMarket(
  conditionId: string
): Promise<Market | null> {
  const url = `${POLYMARKET_GAMMA_URL}/markets/${conditionId}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const raw: PolymarketMarket = await res.json();
  return normalizeMarket(raw);
}
