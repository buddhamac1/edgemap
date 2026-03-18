// ── Polymarket filters ───────────────────────────────────────────
export const MIN_VOLUME = 1_000;       // minimum $ volume to consider
export const MIN_EDGE   = 3;           // minimum % edge to store

// ── Scan limits ───────────────────────────────────────────────────
// Keep total low so the scan fits within the 60-second Vercel limit.
// Each Claude call takes ~3-5s; running 12 in one batch takes ~5-8s total.
export const MAX_MARKETS_PER_RUN = 12;

// ── Volume-tier sampling ──────────────────────────────────────────
// High-vol markets are efficiently priced; mid/low are where edges hide.
export const VOLUME_TIER_HIGH =  100_000;
export const VOLUME_TIER_MID  =   10_000;
export const TIER_HIGH_SAMPLE = 3;   // top-3 high-vol (deterministic)
export const TIER_MID_SAMPLE  = 6;   // 6 random mid-vol each run
export const TIER_LOW_SAMPLE  = 3;   // 3 random low-vol each run

// ── Edge age / expiry ─────────────────────────────────────────────
export const EDGE_TTL_HOURS = 24;    // auto-expire edges after 24 h

// ── Confidence ordering for sort score ───────────────────────────
export const CONFIDENCE_ORDER: Record<string, number> = {
  "A+": 6,
  A:   5,
  "B+": 4,
  B:   3,
  "C+": 2,
  C:   1,
};
