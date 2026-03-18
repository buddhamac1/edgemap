import { Edge, Market, EdgeAnalysis } from "./types";
import { fetchMarkets } from "./polymarket";
import { analyzeMarket } from "./claude";
import {
  MIN_EDGE,
  MAX_MARKETS_PER_RUN,
  CONFIDENCE_ORDER,
  VOLUME_TIER_HIGH,
  VOLUME_TIER_MID,
  TIER_HIGH_SAMPLE,
  TIER_MID_SAMPLE,
  TIER_LOW_SAMPLE,
} from "./constants";
import {
  getActiveEdges,
  storeEdge,
  getAnalysisCache,
  setAnalysisCache,
} from "./storage";

// ── Generate edge ID ───────────────────────────────────────────
function generateEdgeId(market: Market): string {
  return `edge_${market.source}_${market.id}_${Date.now()}`;
}

// ── Check if a market needs re-analysis ────────────────────────
async function shouldAnalyze(market: Market): Promise<boolean> {
  const cached = await getAnalysisCache(market.id);
  if (!cached) return true;
  // Re-analyze if price moved significantly
  const priceDiff = Math.abs(market.marketProb - cached.cachedProb);
  return priceDiff >= 2; // 2% threshold
}

// ── Build Edge from Market + Analysis ──────────────────────────
function buildEdge(market: Market, analysis: EdgeAnalysis): Edge {
  const edgeSize = Math.abs(analysis.estimatedProbability - market.marketProb);
  return {
    id: generateEdgeId(market),
    market,
    category: market.category,
    event: market.question,
    marketProb: market.marketProb,
    aiProb: analysis.estimatedProbability,
    aiProbLow: analysis.probabilityRangeLow,
    aiProbHigh: analysis.probabilityRangeHigh,
    edge: Math.round(edgeSize * 10) / 10,
    confidence: analysis.confidence,
    blurb: analysis.blurb,
    signals: analysis.signals,
    supportingStats: analysis.supportingStats,
    similarSetups: analysis.similarSetups,
    status: "active",
    outcome: null,
    detectedAt: new Date().toISOString(),
    resolvedAt: null,
  };
}

// ── Fisher-Yates shuffle ────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ── Smart volume-tier market selection ─────────────────────────
// High-volume markets are efficiently priced — good to check but few edges.
// Mid and low-volume markets are less watched and more likely to be mispriced.
// We sample each tier separately and shuffle mid/low so every scan rotates
// through different markets rather than always hitting the same top 20.
function prioritizeMarkets(markets: Market[]): Market[] {
  const sorted = [...markets].sort((a, b) => b.volume - a.volume);

  const tierHigh = sorted.filter((m) => m.volume >= VOLUME_TIER_HIGH);
  const tierMid  = sorted.filter((m) => m.volume >= VOLUME_TIER_MID && m.volume < VOLUME_TIER_HIGH);
  const tierLow  = sorted.filter((m) => m.volume < VOLUME_TIER_MID);

  const selected = [
    ...tierHigh.slice(0, TIER_HIGH_SAMPLE),   // Top 10 high-vol (deterministic)
    ...shuffle(tierMid).slice(0, TIER_MID_SAMPLE), // 25 random mid-vol each run
    ...shuffle(tierLow).slice(0, TIER_LOW_SAMPLE), // 15 random low-vol each run
  ];

  console.log(
    `[EdgeDetection] Market tiers — high: ${tierHigh.length}, mid: ${tierMid.length}, low: ${tierLow.length}`
  );
  console.log(
    `[EdgeDetection] Sampling — ${Math.min(tierHigh.length, TIER_HIGH_SAMPLE)} high + ${Math.min(tierMid.length, TIER_MID_SAMPLE)} mid + ${Math.min(tierLow.length, TIER_LOW_SAMPLE)} low = ${selected.length} total`
  );

  return selected.slice(0, MAX_MARKETS_PER_RUN);
}

// ── Main pipeline ──────────────────────────────────────────────
export async function runEdgeDetection(options?: {
  forceRefresh?: boolean;
}): Promise<Edge[]> {
  console.log("[EdgeDetection] Starting edge detection run...");

  // 1. Fetch markets (up to 500 from Polymarket)
  const markets = await fetchMarkets({
    forceRefresh: options?.forceRefresh,
    limit: 500,
  });
  console.log(`[EdgeDetection] Fetched ${markets.length} markets`);

  // 2. Select markets using volume-tier sampling
  const toConsider = prioritizeMarkets(markets);

  // 3. Filter to markets that actually need fresh analysis
  const toAnalyze: Market[] = [];
  for (const market of toConsider) {
    const needed = await shouldAnalyze(market);
    if (needed) toAnalyze.push(market);
  }
  console.log(`[EdgeDetection] ${toAnalyze.length} markets need fresh analysis`);

  // 4. Analyze in batches of 5 with rate-limit delay
  const newEdges: Edge[] = [];
  const batchSize = 5;

  for (let i = 0; i < toAnalyze.length; i += batchSize) {
    const batch = toAnalyze.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (market) => {
        const analysis = await analyzeMarket(market);

        // Cache regardless of whether an edge was found
        await setAnalysisCache(market.id, {
          cachedProb: market.marketProb,
          analysis,
          timestamp: Date.now(),
        });

        if (analysis && analysis.hasEdge) {
          const edge = buildEdge(market, analysis);
          if (edge.edge >= MIN_EDGE) {
            return edge;
          }
        }
        return null;
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        newEdges.push(result.value);
      }
    }

    // Rate limit between batches
    if (i + batchSize < toAnalyze.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // 5. Store new edges
  for (const edge of newEdges) {
    await storeEdge(edge);
  }

  // 6. Sort by edge size × confidence weight
  newEdges.sort((a, b) => {
    const aScore = a.edge * CONFIDENCE_ORDER[a.confidence];
    const bScore = b.edge * CONFIDENCE_ORDER[b.confidence];
    return bScore - aScore;
  });

  console.log(`[EdgeDetection] Detected ${newEdges.length} new edges (MIN_EDGE=${MIN_EDGE}%)`);
  return newEdges;
}

// ── Get all active edges from storage ─────────────────────────
export async function getAllActiveEdges(): Promise<Edge[]> {
  const stored = await getActiveEdges();
  return stored.sort((a, b) => {
    const aScore = a.edge * CONFIDENCE_ORDER[a.confidence];
    const bScore = b.edge * CONFIDENCE_ORDER[b.confidence];
    return bScore - aScore;
  });
}
