import { Edge, AggregateStats, EdgeAnalysis } from "./types";

/**
 * Storage layer — in-memory fallback with Vercel KV interface.
 *
 * When KV_REST_API_URL is set, this will use Vercel KV (Redis).
 * Otherwise, it falls back to an in-memory Map for local development.
 *
 * Swap the implementation to @vercel/kv when deploying:
 *   import { kv } from "@vercel/kv";
 */

// ── In-memory store (dev fallback) ──────────────────────────
const store = new Map<string, string>();

async function get<T>(key: string): Promise<T | null> {
  const val = store.get(key);
  if (!val) return null;
  try {
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
}

async function set(key: string, value: unknown, ttlMs?: number): Promise<void> {
  store.set(key, JSON.stringify(value));
  if (ttlMs) {
    setTimeout(() => store.delete(key), ttlMs);
  }
}

async function del(key: string): Promise<void> {
  store.delete(key);
}

// ── Edge operations ─────────────────────────────────────────
const ACTIVE_EDGES_KEY = "edges:active";
const RESOLVED_EDGES_KEY = "edges:resolved";

export async function storeEdge(edge: Edge): Promise<void> {
  // Store the edge data
  await set(`edge:${edge.id}`, edge);

  // Add to active index
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
    if (edge) {
      edges.push(edge);
    }
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

  // Move from active to resolved index
  const activeIds = (await get<string[]>(ACTIVE_EDGES_KEY)) || [];
  await set(
    ACTIVE_EDGES_KEY,
    activeIds.filter((id) => id !== edgeId)
  );

  const resolvedIds = (await get<string[]>(RESOLVED_EDGES_KEY)) || [];
  resolvedIds.push(edgeId);
  await set(RESOLVED_EDGES_KEY, resolvedIds);

  // Update aggregate stats
  await updateStats(outcome, edge.edge);
}

export async function fadeEdge(edgeId: string): Promise<void> {
  const edge = await get<Edge>(`edge:${edgeId}`);
  if (!edge) return;

  edge.status = "faded";
  await set(`edge:${edgeId}`, edge);

  // Remove from active
  const activeIds = (await get<string[]>(ACTIVE_EDGES_KEY)) || [];
  await set(
    ACTIVE_EDGES_KEY,
    activeIds.filter((id) => id !== edgeId)
  );
}

// ── Analysis cache ──────────────────────────────────────────
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

  // Expire after 60 minutes
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

// ── Aggregate stats ─────────────────────────────────────────
const STATS_KEY = "stats:aggregate";

export async function getStats(): Promise<AggregateStats> {
  const stats = await get<AggregateStats>(STATS_KEY);
  if (stats) return stats;

  // Compute from stored edges
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
