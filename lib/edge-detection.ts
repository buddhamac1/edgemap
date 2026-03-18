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

// ── Generate edge ID ──────────────────────────────────────────────
function generateEdgeId(market: Market): string {
  return `edge_${market.source}_${market.id}_${Date.now()}`;
}

// ── Check if a market needs re-analysis ───────────────────────────
async function shouldAnalyze(market: Market): Promise<boolean> {
  const cached = await getAnalysisCache(market.id);
  if (!cached) return true;
  const priceDiff = Math.abs(market.marketProb - cached.cachedProb);
  return priceDiff >= 2;
}

// ── Build Edge from Market + Analysis ─────────────────────────────
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

// ── Fisher-Yates shuffle ──────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ── Smart volume-tier market selection ────────────────────────────
function prioritizeMarkets(markets: Market[]): Market[] {
  const sorted = [...markets].sort((a, b) => b.volume - a.volume);
  const tierHigh = sorted.filter((m) => m.volume >= VOLUME_TIER_HIGH);
  const tierMid  = sorted.filter((m) => m.volume >= VOLUME_TIER_MID && m.volume < VOLUME_TIER_HIGH);
  const tierLow  = sorted.filter((m) => m.volume < VOLUME_TIER_MID);

  const selected = [
    ...tierHigh.slice(0, TIER_HIGH_SAMPLE),
    ...shuffle(tierMid).slice(0, TIER_MID_SAMPLE),
    ...shuffle(tierLow).slice(0, TIER_LOW_SAMPLE),
  ];

  console.log(
    `[EdgeDetection] Tiers — high:${tierHigh.length} mid:${tierMid.length} low:${tierLow.length}`
  );
  console.log(
    `[EdgeDetection] Selected ${selected.length} markets (max ${MAX_MARKETS_PER_RUN})`
  );

  return selected.slice(0, MAX_MARKETS_PER_RUN);
}

// ── Main pipeline ─────────────────────────────────────────────────
export async function runEdgeDetection(options?: {
  forceRefresh?: boolean;
}): Promise<Edge[]> {
  console.log("[EdgeDetection] Starting run...");

  // 1. Fetch markets
  const markets = await fetchMarkets({
    forceRefresh: options?.forceRefresh,
    limit: 500,
  });
  console.log(`[EdgeDetection] Fetched ${markets.length} markets`);

  // 2. Volume-tier sampling
  const toConsider = prioritizeMarkets(markets);

  // 3. Filter to markets that need fresh analysis
  const toAnalyze: Market[] = [];
  for (const market of toConsider) {
    if (await shouldAnalyze(market)) toAnalyze.push(market);
  }
  console.log(`[EdgeDetection] ${toAnalyze.length} need fresh analysis`);

  // 4. Run ALL markets in a single parallel batch — no inter-batch delay.
  //    MAX_MARKETS_PER_RUN is set to 12 so this comfortably fits in 60 s.
  const results = await Promise.allSettled(
    toAnalyze.map(async (market) => {
      const analysis = await analyzeMarket(market);

      await setAnalysisCache(market.id, {
        cachedProb: market.marketProb,
        analysis,
        timestamp: Date.now(),
      });

      if (analysis && analysis.hasEdge) {
        const edge = buildEdge(market, analysis);
        if (edge.edge >= MIN_EDGE) return edge;
      }
      return null;
    })
  );

  const newEdges: Edge[] = [];
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      newEdges.push(result.value);
    }
  }

  // 5. Store new edges
  for (const edge of newEdges) {
    await storeEdge(edge);
  }

  // 6. Sort by edge × confidence weight
  newEdges.sort((a, b) => {
    const aScore = a.edge * CONFIDENCE_ORDER[a.confidence];
    const bScore = b.edge * CONFIDENCE_ORDER[b.confidence];
    return bScore - aScore;
  });

  console.log(
    `[EdgeDetection] Done — ${newEdges.length} new edges found (MIN_EDGE=${MIN_EDGE}%)`
  );
  return newEdges;
}

// ── Get all active edges from storage ────────────────────────────
export async function getAllActiveEdges(): Promise<Edge[]> {
  const stored = await getActiveEdges();
  return stored.sort((a, b) => {
    const aScore = a.edge * CONFIDENCE_ORDER[a.confidence];
    const bScore = b.edge * CONFIDENCE_ORDER[b.confidence];
    return bScore - aScore;
  });
}
