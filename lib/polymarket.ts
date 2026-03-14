import { Market, MarketCategory, PolymarketMarket } from "./types";
import {
  POLYMARKET_GAMMA_URL,
  CATEGORY_KEYWORDS,
  MIN_VOLUME,
} from "./constants";

// ── In-memory cache ─────────────────────────────────────────
let marketCache: { data: Market[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── Category detection ──────────────────────────────────────
export function detectCategory(question: string): MarketCategory {
  const q = question.toLowerCase();

  // Check each category's keywords; return first match
  // Priority: specific sports leagues before generic "Sports"
  const orderedCategories: (Exclude<MarketCategory, "Other">)[] = [
    "NBA",
    "NFL",
    "Sports",
    "Crypto",
    "Politics",
    "Economy",
    "Entertainment",
    "Tech",
  ];

  for (const category of orderedCategories) {
    const keywords = CATEGORY_KEYWORDS[category];
    for (const keyword of keywords) {
      if (q.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return "Other";
}

// ── Normalize Polymarket data ───────────────────────────────
function normalizeMarket(raw: PolymarketMarket): Market | null {
  // Parse prices — use outcome_prices or first token price
  let marketProb = 50;

  if (raw.outcome_prices) {
    try {
      const prices = JSON.parse(raw.outcome_prices);
      if (Array.isArray(prices) && prices.length > 0) {
        marketProb = Math.round(parseFloat(prices[0]) * 100);
      }
    } catch {
      // fallback to tokens
    }
  }

  if (marketProb === 50 && raw.tokens?.length > 0) {
    const yesToken = raw.tokens.find(
      (t) => t.outcome?.toLowerCase() === "yes"
    );
    if (yesToken) {
      marketProb = Math.round(yesToken.price * 100);
    } else {
      marketProb = Math.round(raw.tokens[0].price * 100);
    }
  }

  const volume = raw.volume_num || raw.volume || 0;

  // Skip low-volume markets
  if (volume < MIN_VOLUME) return null;

  // Skip closed/resolved markets
  if (raw.closed) return null;

  const category = detectCategory(raw.question);

  return {
    id: raw.condition_id,
    source: "polymarket",
    question: raw.question,
    category,
    marketProb,
    volume,
    endDate: raw.end_date_iso || raw.game_start_time || "",
    url: `https://polymarket.com/event/${raw.market_slug || raw.condition_id}`,
    rawData: raw as unknown as Record<string, unknown>,
  };
}

// ── Fetch markets ───────────────────────────────────────────
export async function fetchMarkets(
  options: {
    category?: MarketCategory;
    limit?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<Market[]> {
  const { category, limit = 200, forceRefresh = false } = options;

  // Check cache
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
  const maxPages = 5; // Safety limit

  while (pages < maxPages) {
    const url = new URL(`${POLYMARKET_GAMMA_URL}/markets`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("active", "true");
    url.searchParams.set("closed", "false");
    url.searchParams.set("order", "volume");
    url.searchParams.set("ascending", "false");

    if (cursor) {
      url.searchParams.set("next_cursor", cursor);
    }

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 }, // 5 min ISR cache
    });

    if (!res.ok) {
      console.error(`Polymarket API error: ${res.status} ${res.statusText}`);
      break;
    }

    const data = await res.json();
    const rawMarkets: PolymarketMarket[] = Array.isArray(data)
      ? data
      : data.data || [];

    if (rawMarkets.length === 0) break;

    for (const raw of rawMarkets) {
      const market = normalizeMarket(raw);
      if (market) {
        allMarkets.push(market);
      }
    }

    // Pagination
    cursor = data.next_cursor;
    if (!cursor) break;
    pages++;
  }

  // Cache the result
  marketCache = { data: allMarkets, timestamp: Date.now() };

  let filtered = allMarkets;
  if (category && category !== "Other") {
    filtered = filtered.filter((m) => m.category === category);
  }

  return filtered.slice(0, limit);
}

// ── Fetch single market ─────────────────────────────────────
export async function fetchMarket(
  conditionId: string
): Promise<Market | null> {
  const url = `${POLYMARKET_GAMMA_URL}/markets/${conditionId}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) return null;

  const raw: PolymarketMarket = await res.json();
  return normalizeMarket(raw);
}
