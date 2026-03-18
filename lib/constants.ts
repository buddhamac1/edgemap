import { MarketCategory, ConfidenceGrade } from "./types";

// ── Polymarket ────────────────────────────────────────────────
export const POLYMARKET_BASE_URL =
  process.env.POLYMARKET_API_URL || "https://clob.polymarket.com";
export const POLYMARKET_GAMMA_URL = "https://gamma-api.polymarket.com";

// ── Thresholds ────────────────────────────────────────────────
export const MIN_VOLUME = 1_000;        // $1k minimum — cast a wider net
export const MIN_EDGE = 3;             // 3% minimum edge (was 5%) — surface more signals
export const STALE_EDGE_HOURS = 24;    // mark edges stale after 24h without refresh
export const CACHE_TTL_MINUTES = 5;   // market data cache
export const ANALYSIS_CACHE_TTL_MINUTES = 60; // Claude analysis cache
export const PRICE_CHANGE_THRESHOLD = 2; // re-analyze if price moves 2%+
export const MAX_MARKETS_PER_RUN = 50; // analyze 50 per scan (was 20)

// ── Volume tiers for market sampling ─────────────────────────
// High-volume markets are efficiently priced; mid/low tiers have more edge
export const VOLUME_TIER_HIGH = 100_000;  // > $100k: liquid, few edges, sample lightly
export const VOLUME_TIER_MID  =  10_000;  // $10k–$100k: best hunting ground
// Below VOLUME_TIER_MID = lower tier: illiquid but sometimes mispriced

// ── Tier sample sizes (must sum to <= MAX_MARKETS_PER_RUN) ───
export const TIER_HIGH_SAMPLE = 10; // always check top 10 high-vol markets
export const TIER_MID_SAMPLE  = 25; // randomly sample 25 mid-vol each run
export const TIER_LOW_SAMPLE  = 15; // randomly sample 15 low-vol each run

// ── Confidence order (for sorting/filtering) ─────────────────
export const CONFIDENCE_ORDER: Record<ConfidenceGrade, number> = {
  "A+": 6,
  A: 5,
  "B+": 4,
  B: 3,
  "C+": 2,
  C: 1,
};

// ── Category keywords ─────────────────────────────────────────
export const CATEGORY_KEYWORDS: Record<
  Exclude<MarketCategory, "Other">,
  string[]
> = {
  NBA: [
    "nba", "basketball", "lakers", "celtics", "warriors", "nuggets",
    "bucks", "76ers", "sixers", "heat", "knicks", "nets", "suns",
    "mavericks", "mavs", "clippers", "grizzlies", "cavaliers", "cavs",
    "thunder", "timberwolves", "wolves", "pacers", "hawks", "bulls",
    "magic", "pelicans", "kings", "raptors", "spurs", "rockets",
    "pistons", "hornets", "wizards", "blazers", "jazz", "lebron",
    "curry", "jokic", "giannis", "luka", "tatum", "durant", "embiid",
    "doncic", "mvp", "finals", "playoff", "all-star",
  ],
  NFL: [
    "nfl", "football", "super bowl", "chiefs", "eagles", "49ers",
    "niners", "cowboys", "bills", "ravens", "lions", "dolphins", "jets",
    "bengals", "texans", "packers", "rams", "steelers", "jaguars",
    "seahawks", "chargers", "broncos", "browns", "vikings", "saints",
    "bears", "falcons", "buccaneers", "bucs", "raiders", "colts",
    "panthers", "commanders", "cardinals", "titans", "giants",
    "patriots", "mahomes", "kelce", "hurts", "lamar", "allen",
    "touchdown", "quarterback",
  ],
  Sports: [
    "mlb", "baseball", "nhl", "hockey", "soccer", "mls",
    "premier league", "champions league", "world cup", "tennis",
    "grand slam", "wimbledon", "ufc", "mma", "boxing", "f1",
    "formula 1", "golf", "pga", "olympics", "world series",
    "stanley cup",
  ],
  Crypto: [
    "bitcoin", "btc", "ethereum", "eth", "crypto", "solana", "sol",
    "dogecoin", "doge", "xrp", "ripple", "token", "blockchain", "defi",
    "nft", "altcoin", "binance", "coinbase", "stablecoin", "memecoin",
  ],
  Politics: [
    "election", "president", "senate", "congress", "house", "vote",
    "democrat", "republican", "gop", "biden", "trump", "desantis",
    "governor", "primary", "caucus", "poll", "swing state", "electoral",
    "cabinet", "impeach", "legislation", "bill", "veto",
    "supreme court", "scotus",
  ],
  Economy: [
    "fed", "federal reserve", "cpi", "inflation", "gdp",
    "interest rate", "rate cut", "rate hike", "unemployment", "jobs",
    "nonfarm", "payroll", "recession", "s&p", "nasdaq", "dow",
    "treasury", "yield", "debt ceiling", "tariff", "trade",
  ],
  Entertainment: [
    "oscar", "emmy", "grammy", "golden globe", "box office", "album",
    "movie", "film", "tv show", "netflix", "disney", "streaming",
    "billboard", "concert", "tour", "award", "nomination", "celebrity",
    "reality tv",
  ],
  Tech: [
    "ai", "artificial intelligence", "openai", "google", "apple",
    "meta", "microsoft", "tesla", "spacex", "launch", "ipo", "startup",
    "semiconductor", "chip", "nvidia", "software", "app store",
    "antitrust", "regulation",
  ],
};

// ── UI ────────────────────────────────────────────────────────
export const CATEGORY_COLORS: Record<MarketCategory, string> = {
  NBA: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  NFL: "bg-green-500/20 text-green-400 border-green-500/30",
  Sports: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Crypto: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Politics: "bg-red-500/20 text-red-400 border-red-500/30",
  Economy: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Entertainment: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Tech: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Other: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export const CONFIDENCE_COLORS: Record<ConfidenceGrade, string> = {
  "A+": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  A: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  "B+": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  B: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  "C+": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  C: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

export const ALL_CATEGORIES: MarketCategory[] = [
  "NBA", "NFL", "Sports", "Crypto", "Politics",
  "Economy", "Entertainment", "Tech", "Other",
];
