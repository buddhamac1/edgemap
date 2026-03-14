export interface Market {
  id: string;
  source: "polymarket" | "kalshi";
  question: string;
  category: MarketCategory;
  marketProb: number; // 0-100
  volume: number;
  endDate: string;
  url: string;
  rawData: Record<string, unknown>;
}

export type MarketCategory =
  | "NBA"
  | "NFL"
  | "Sports"
  | "Crypto"
  | "Politics"
  | "Economy"
  | "Entertainment"
  | "Tech"
  | "Other";

export type ConfidenceGrade = "A+" | "A" | "B+" | "B" | "C+" | "C";

export type EdgeStatus = "active" | "resolved" | "faded";

export type EdgeOutcome = "hit" | "miss" | null;

export interface Edge {
  id: string;
  market: Market;
  category: MarketCategory;
  event: string;
  marketProb: number;
  aiProb: number;
  aiProbLow: number;
  aiProbHigh: number;
  edge: number; // absolute difference
  confidence: ConfidenceGrade;
  blurb: string;
  signals: string[];
  supportingStats: string;
  similarSetups: string;
  status: EdgeStatus;
  outcome: EdgeOutcome;
  detectedAt: string; // ISO
  resolvedAt: string | null;
}

export interface EdgeAnalysis {
  hasEdge: boolean;
  estimatedProbability: number;
  probabilityRangeLow: number;
  probabilityRangeHigh: number;
  confidence: ConfidenceGrade;
  blurb: string;
  signals: string[];
  supportingStats: string;
  similarSetups: string;
}

export interface EdgeFilters {
  category?: MarketCategory | "All";
  minConfidence?: ConfidenceGrade;
  sortBy?: "edge" | "confidence" | "recency" | "volume";
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: EdgeStatus | "all";
}

export interface AggregateStats {
  totalSignals: number;
  activeSignals: number;
  hits: number;
  misses: number;
  hitRate: number;
  avgEdge: number;
  bestEdge: number;
}

export interface PolymarketToken {
  token_id: string;
  outcome: string;
  price: number;
  winner: boolean;
}

export interface PolymarketMarket {
  condition_id: string;
  question: string;
  description: string;
  market_slug: string;
  end_date_iso: string;
  game_start_time: string;
  active: boolean;
  closed: boolean;
  tokens: PolymarketToken[];
  volume: number;
  volume_num: number;
  outcome_prices: string; // JSON string of prices
  outcomes: string; // JSON string
  tags: string[];
}
