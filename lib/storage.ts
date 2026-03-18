import { kv } from "@vercel/kv";
import { Edge, AggregateStats, EdgeAnalysis } from "./types";

// ── KV helpers (wraps @vercel/kv with graceful error handling) ─
async function get<T>(key: string): Promise<T | null> {
  try {
    return await kv.get<T>(key);
  } catch (error) {
    console.warn(`KV get failed for ${key}:`, error);
    return null;
  }
}

async function set(key: string, value: unknown, ttlMs?: number): Promise<void> {
  try {
    if (ttlMs) {
      await kv.set(key, value, { px: ttlMs });
    } else {
      await kv.set(key, value);
    }
  } catch (error) {
    console.warn(`KV set failed for ${key}:`, error);
  }
}

async function del(key: string): Promise<void> {
  try {
    await kv.del(key);
  } catch (error) {
    console.warn(`KV del failed for ${key}:`, error);
  }
}

// ── Edge operations ────────────────────────────────────────────
const ACTIVE_EDGES_KEY = "edges:active";
const RESOLVED_EDGES_KEY = "edges:resolved";

export async function storeEdge(edge: Edge): Promise<void> {
  await set(`edge:${edge.id}`, edge);
  const activeIds = (await get<string[]>(ACTIVE_EDGES_KEY)) || [];
  if (!activeIds.includes(edge.id)) {
    activeIds.push(edge.id);
    await set(ACTIVE_EDGES_KEY, activeIds);
  }
}

export async function getEdge(edgeId: string): Promise<Edge | null> {
  return get<Edge>(`edge:${edgeId}`);
}

export async function getActiveEdges(): Promise<Edge[]> {
  const activeIds = (await get<string[]>(ACTIVE_EDGES_KEY)) || [];
  const edges: Edge[] = [];
  for (const id of activeIds) {
    const edge = await get<Edge>(`edge:${id}`);
    if (edge && edge.status === "active") {
      edges.push(edge);
    }
  }
  return edges;
}

export async function getResolvedEdges(): Promise<Edge[]> {
  const resolvedIds = (await get<string[]>(RESOLVED_EDGES_KEY)) || [];
  const edges: Edge[] = [];
  for (const id of resolvedIds) {
    const edge = await get<Edge>(`edge:${id}`);
    if (edge) edges.push(edge);
  }
  return edges;
}

export async function resolveEdge(
  edgeId: string,
  outcome: "hit" | "miss"
): Promise<void> {
  const edge = await get<Edge>(`edge:${edgeId}`);
  if (!edge) return;

  edge.status = "resolved";
  edge.outcome = outcome;
  edge.resolvedAt = new Date().toISOString();
  await set(`edge:${edgeId}`, edge);

  const activeIds = (await get<string[]>(ACTIVE_EDGES_KEY)) || [];
  await set(ACTIVE_EDGES_KEY, activeIds.filter((id) => id !== edgeId));

  const resolvedIds = (await get<string[]>(RESOLVED_EDGES_KEY)) || [];
  resolvedIds.push(edgeId);
  await set(RESOLVED_EDGES_KEY, resolvedIds);

  await updateStats(outcome, edge.edge);
}

export async function fadeEdge(edgeId: string): Promise<void> {
  const edge = await get<Edge>(`edge:${edgeId}`);
  if (!edge) return;

  edge.status = "faded";
  await set(`edge:${edgeId}`, edge);

  const activeIds = (await get<string[]>(ACTIVE_EDGES_KEY)) || [];
  await set(ACTIVE_EDGES_KEY, activeIds.filter((id) => id !== edgeId));
}

// ── Analysis cache ─────────────────────────────────────────────
interface CachedAnalysis {
  cachedProb: number;
  analysis: EdgeAnalysis | null;
  timestamp: number;
}

export async function getAnalysisCache(
  marketId: string
): Promise<CachedAnalysis | null> {
  const cached = await get<CachedAnalysis>(`analysis:cache:${marketId}`);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > 60 * 60 * 1000) {
    await del(`analysis:cache:${marketId}`);
    return null;
  }
  return cached;
}

export async function setAnalysisCache(
  marketId: string,
  data: CachedAnalysis
): Promise<void> {
  await set(`analysis:cache:${marketId}`, data, 60 * 60 * 1000);
}

// ── Aggregate stats ────────────────────────────────────────────
const STATS_KEY = "stats:aggregate";

export async function getStats(): Promise<AggregateStats> {
  const stats = await get<AggregateStats>(STATS_KEY);
  if (stats) return stats;

  const active = await getActiveEdges();
  const resolved = await getResolvedEdges();
  const hits = resolved.filter((e) => e.outcome === "hit").length;
  const misses = resolved.filter((e) => e.outcome === "miss").length;
  const total = resolved.length;
  const allEdges = [...active, ...resolved];
  const avgEdge =
    allEdges.length > 0
      ? allEdges.reduce((sum, e) => sum + e.edge, 0) / allEdges.length
      : 0;
  const bestEdge =
    allEdges.length > 0 ? Math.max(...allEdges.map((e) => e.edge)) : 0;

  return {
    totalSignals: active.length + resolved.length,
    activeSignals: active.length,
    hits,
    misses,
    hitRate: total > 0 ? Math.round((hits / total) * 100) : 0,
    avgEdge: Math.round(avgEdge * 10) / 10,
    bestEdge: Math.round(bestEdge * 10) / 10,
  };
}

async function updateStats(
  outcome: "hit" | "miss",
  edgeSize: number
): Promise<void> {
  const stats = await getStats();
  if (outcome === "hit") stats.hits++;
  else stats.misses++;
  const total = stats.hits + stats.misses;
  stats.hitRate = total > 0 ? Math.round((stats.hits / total) * 100) : 0;
  stats.totalSignals++;
  await set(STATS_KEY, stats);
}
