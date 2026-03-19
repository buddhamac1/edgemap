import { Market, EdgeAnalysis } from "./types";
import { MIN_EDGE } from "./constants";

// Minimum Jaccard similarity to accept a question match
const MATCH_THRESHOLD = 0.3;

interface ExternalMarket {
  question: string;
  probability: number; // 0-100
  source: string;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

async function searchManifold(question: string): Promise<ExternalMarket | null> {
  try {
    const url =
      `https://api.manifold.markets/v0/search-markets?term=${encodeURIComponent(
        question.slice(0, 100)
      )}&limit=8&filter=open`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const markets = await res.json();

    const qTokens = tokenize(question);
    let best: ExternalMarket | null = null;
    let bestScore = 0;

    for (const m of markets) {
      if (m.isResolved || m.outcomeType !== "BINARY" || m.probability == null) continue;
      const score = jaccardSimilarity(qTokens, tokenize(m.question ?? ""));
      if (score > bestScore && score >= MATCH_THRESHOLD) {
        bestScore = score;
        best = {
          question: m.question,
          probability: Math.round(m.probability * 100),
          source: "Manifold",
        };
      }
    }
    return best;
  } catch {
    return null;
  }
}

async function searchMetaculus(question: string): Promise<ExternalMarket | null> {
  try {
    const url =
      `https://www.metaculus.com/api2/questions/?search=${encodeURIComponent(
        question.slice(0, 80)
      )}&limit=8&format=json&type=forecast`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    const results: unknown[] = data.results ?? [];

    const qTokens = tokenize(question);
    let best: ExternalMarket | null = null;
    let bestScore = 0;

    for (const q of results as Record<string, unknown>[]) {
      const probObj =
        (q.community_prediction as Record<string, unknown> | undefined)
          ?.full as Record<string, unknown> | undefined;
      const p = probObj?.q2 as number | undefined;
      if (p == null || q.resolution != null) continue;
      const score = jaccardSimilarity(qTokens, tokenize((q.title as string) ?? ""));
      if (score > bestScore && score >= MATCH_THRESHOLD) {
        bestScore = score;
        best = {
          question: q.title as string,
          probability: Math.round(p * 100),
          source: "Metaculus",
        };
      }
    }
    return best;
  } catch {
    return null;
  }
}

function gradeConfidence(
  diff: number,
  sourceCount: number
): EdgeAnalysis["confidence"] {
  if (sourceCount >= 2 && diff >= 8) return "A+";
  if (diff >= 10) return "A+";
  if (diff >= 8) return "A";
  if (diff >= 6) return "B+";
  if (diff >= 4) return "B";
  return "C+";
}

export async function analyzeMarket(
  market: Market
): Promise<EdgeAnalysis | null> {
  try {
    const [manifold, metaculus] = await Promise.all([
      searchManifold(market.question),
      searchMetaculus(market.question),
    ]);

    const sources = [manifold, metaculus].filter(Boolean) as ExternalMarket[];
    if (sources.length === 0) return null;

    const avgExternal = Math.round(
      sources.reduce((sum, s) => sum + s.probability, 0) / sources.length
    );

    const diff = Math.abs(avgExternal - market.marketProb);
    if (diff < MIN_EDGE) return null;

    const direction = avgExternal > market.marketProb ? "YES" : "NO";
    const confidence = gradeConfidence(diff, sources.length);

    const signals = [
      ...sources.map(
        (s) => `${s.source}: ${s.probability}% vs Polymarket ${market.marketProb}%`
      ),
      `Cross-market divergence: ${diff} percentage points`,
    ];

    const sourceNames = sources.map((s) => s.source).join(" and ");
    const blurb =
      `${sourceNames} price this at ${avgExternal}%, a ${diff}-point gap from Polymarket's ${market.marketProb}%. ` +
      `Crowd consensus across independent markets indicates ${direction} is mispriced — ` +
      `$${Math.round(market.volume).toLocaleString()} in Polymarket volume has not closed the spread.`;

    return {
      hasEdge: true,
      estimatedProbability: avgExternal,
      probabilityRangeLow: Math.min(...sources.map((s) => s.probability)) - 2,
      probabilityRangeHigh: Math.max(...sources.map((s) => s.probability)) + 2,
      confidence,
      blurb,
      signals,
      supportingStats: sources.map((s) => `${s.source}: ${s.probability}%`).join(", "),
      similarSetups:
        sources.length >= 2
          ? `Confirmed across ${sources.length} independent prediction markets`
          : `Sourced from ${sources[0].source}`,
    };
  } catch (error) {
    console.error(`Cross-market analysis failed for market ${market.id}:`, error);
    return null;
  }
}
