import { Edge, Market, EdgeAnalysis } from "./types";
import { fetchMarkets } from "./polymarket";
import { analyzeMarket } from "./claude";
import {
  MIN_EDGE,
  MAX_MARKETS_PER_RUN,
  CONFIDENCE_ORDER,
} from "./constants";
import { getActiveEdges, storeEdge, getAnalysisCache, setAnalysisCache } from "./storage";

// ── Generate edge ID ────────────────────────────────────────
function generateEdgeId(market: Market): string {
  return `edge_${market.source}_${market.id}_${Date.now()}`;
}

// ── Check if a market needs re-analysis ─────────────────────
async function shouldAnalyze(market: Market): Promise<boolean> {
  const cached = await getAnalysisCache(market.id);
  if (!cached) return true;

  // Re-analyze if price moved significantly
  const priceDiff = Math.abs(market.marketProb - cached.cachedProb);
  return priceDiff >= 2; // 2% threshold
}

// ── Build Edge from Market + Analysis ───────────────────────
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

// ── Sort + prioritize markets for analysis ──────────────────
function prioritizeMarkets(markets: Market[]): Market[] {
  return [...markets]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, MAX_MARKETS_PER_RUN);
}

// ── Main pipeline ───────────────────────────────────────────
export async function runEdgeDetection(options?: {
  forceRefresh?: boolean;
}): Promise<Edge[]> {
  console.log("[EdgeDetection] Starting edge detection run...");

  // 1. Fetch all active markets
  const markets = await fetchMarkets({
    forceRefresh: options?.forceRefresh,
    limit: 200,
  });
  console.log(`[EdgeDetection] Fetched ${markets.length} markets`);

  // 2. Filter to markets worth analyzing
  const toAnalyze: Market[] = [];
  for (const market of prioritizeMarkets(markets)) {
    const needed = await shouldAnalyze(market);
    if (needed) {
      toAnalyze.push(market);
    }
  }
  console.log(`[EdgeDetection] ${toAnalyze.length} markets need analysis`);

  // 3. Analyze in batches of 5 with delays
  const newEdges: Edge[] = [];
  const batchSize = 5;

  for (let i = 0; i < toAnalyze.length; i += batchSize) {
    const batch = toAnalyze.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(async (market) => {
        const analysis = await analyzeMarket(market);

        // Cache the analysis result regardless of edge
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

  // 4. Store new edges
  for (const edge of newEdges) {
    await storeEdge(edge);
  }

  // 5. Sort by edge size * confidence
  newEdges.sort((a, b) => {
    const aScore = a.edge * CONFIDENCE_ORDER[a.confidence];
    const bScore = b.edge * CONFIDENCE_ORDER[b.confidence];
    return bScore - aScore;
  });

  console.log(
    `[EdgeDetection] Detected ${newEdges.length} new edges`
  );

  return newEdges;
}

// ── Get all active edges (from storage + new) ───────────────
export async function getAllActiveEdges(): Promise<Edge[]> {
  const stored = await getActiveEdges();
  return stored.sort((a, b) => {
    const aScore = a.edge * CONFIDENCE_ORDER[a.confidence];
    const bScore = b.edge * CONFIDENCE_ORDER[b.confidence];
    return bScore - aScore;
  });
}
