import { Edge, AggregateStats } from "@/lib/types";

export const MOCK_EDGES: Edge[] = [
  {
    id: "edge-nba-001",
    category: "Sports",
    event: "NBA: Jazz Defensively Underrated vs Western Conference",
    blurb:
      "Jazz defensive rating has improved 4 possessions over last 8 games. Vegas line hasn't adjusted proportionally; sharp money gradually shifting to Jazz -3.5 range. Closing line movement suggests early sharp action missing from public models.",
    signals: ["defensive-efficiency", "line-movement", "public-action"],
    confidence: "A",
    marketProb: 45,
    aiProb: 52,
    aiProbLow: 48,
    aiProbHigh: 56,
    edge: 7,
    status: "active",
    outcome: null,
    detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    supportingStats: "Last 8 games: +4 defensive rating improvement vs season avg",
    similarSetups: "Similar line movement patterns in 3 previous matchups this season",
    market: {
      id: "nba-jazz-001",
      source: "polymarket",
      question: "Will Jazz cover -3.5 vs Western Conference?",
      category: "NBA",
      marketProb: 45,
      volume: 250000,
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://polymarket.com",
      rawData: {},
    },
  },
  {
    id: "edge-crypto-001",
    category: "Crypto",
    event: "Bitcoin: Funding Rates Signal Overcrowded Long Positioning",
    blurb:
      "Perpetual futures funding rates hit 0.12% 4h, highest in 6 weeks. Aggregate exchange flows show net inflows to shorting venues. Historical correlation suggests mean reversion within 72 hours. Risk/reward tilts 2.3:1 on BTC retracement to $64k zone.",
    signals: ["funding-rates", "futures-positioning", "mean-reversion"],
    confidence: "B",
    marketProb: 55,
    aiProb: 48,
    aiProbLow: 44,
    aiProbHigh: 52,
    edge: 7,
    status: "active",
    outcome: null,
    detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    supportingStats: "Funding rate at 0.12% (6 week high), exchange flows net negative",
    similarSetups: "2 similar patterns in past 90 days, both reverted within 72h",
    market: {
      id: "btc-price-march",
      source: "polymarket",
      question: "Will BTC fall below $64k in next 72 hours?",
      category: "Crypto",
      marketProb: 55,
      volume: 450000,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://polymarket.com",
      rawData: {},
    },
  },
  {
    id: "edge-nfl-001",
    category: "NFL",
    event: "NFL: Browns QB Health Data Suggests Sharper Initial Modeling",
    blurb:
      "Browns QB shoulder injury severity was publicly underestimated by Vegas sharp books. Backup performance data vs playoff defenses runs 4-5 yards/attempt below starter. Market pricing for playoff QB-dependent correlations appears disconnected from historical tendencies.",
    signals: ["personnel-changes", "historical-data", "line-inefficiency"],
    confidence: "B+",
    marketProb: 52,
    aiProb: 45,
    aiProbLow: 41,
    aiProbHigh: 49,
    edge: 7,
    status: "active",
    outcome: null,
    detectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    supportingStats: "Backup avg: 4.2 yards/attempt vs starter 8.8 in similar defenses",
    similarSetups: "3 historical precedents with avg -4.8 yards/attempt impact",
    market: {
      id: "browns-playoff",
      source: "polymarket",
      question: "Will Browns cover spread without starter QB?",
      category: "NFL",
      marketProb: 52,
      volume: 380000,
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://polymarket.com",
      rawData: {},
    },
  },
  {
    id: "edge-politics-001",
    category: "Politics",
    event: "US Senate: Demographic Shifts Underpriced in Regional Betting",
    blurb:
      "Latest voter registration data in swing districts shows 3.2% net movement toward independent status. Betting markets still apply legacy turnout models; updated ORCA-style models run 120 bps tighter races. Implied probabilities lag demographic updates by 3-5 trading days.",
    signals: ["voter-registration", "demographic-data", "polling-lag"],
    confidence: "B",
    marketProb: 48,
    aiProb: 44,
    aiProbLow: 40,
    aiProbHigh: 48,
    edge: 4,
    status: "active",
    outcome: null,
    detectedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    supportingStats: "3.2% independent registration growth in swing districts last 60d",
    similarSetups: "2 precedents with similar demographic swing patterns",
    market: {
      id: "senate-2026",
      source: "polymarket",
      question: "Senate outcome in swing state race?",
      category: "Politics",
      marketProb: 48,
      volume: 220000,
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://polymarket.com",
      rawData: {},
    },
  },
  {
    id: "edge-economy-001",
    category: "Economy",
    event: "Fed Rate Cut Odds: Inflation Data Volatility Underpriced",
    blurb:
      "Market has priced 3.1 cuts for 2026; recent PCE momentum suggests initial reaction overweighted transitory components. Sticky services inflation running 3.8% YoY creates tail risk for longer-duration positioning. Binary positioning on May FOMC creates inefficiency in March/April derivatives.",
    signals: ["inflation-data", "fed-policy", "term-structure"],
    confidence: "A",
    marketProb: 35,
    aiProb: 42,
    aiProbLow: 38,
    aiProbHigh: 46,
    edge: 7,
    status: "active",
    outcome: null,
    detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    supportingStats: "Services inflation: 3.8% YoY (vs market assumption 2.9%)",
    similarSetups: "Similar PCE momentum patterns in 2023-2024 cycle",
    market: {
      id: "fed-rate-may",
      source: "polymarket",
      question: "Will Fed cut rates by May 2026?",
      category: "Economy",
      marketProb: 35,
      volume: 680000,
      endDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://polymarket.com",
      rawData: {},
    },
  },
  {
    id: "edge-entertainment-001",
    category: "Entertainment",
    event: "Oscar Pool: Editing Category Undervalues Technical Efficiency",
    blurb:
      "Editing category historically favors character-driven narratives; this year's frontrunner (action-heavy tech drama) breaks trend. Historical voting data on technical-focused winners run 15% higher when directed by repeat Academy voters. Distribution data suggests market hasn't fully adjusted.",
    signals: ["historical-patterns", "voter-behavior", "technical-voting"],
    confidence: "B",
    marketProb: 62,
    aiProb: 70,
    aiProbLow: 65,
    aiProbHigh: 75,
    edge: 8,
    status: "active",
    outcome: null,
    detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    supportingStats: "Technical-focused winners: +15% when with repeat director",
    similarSetups: "3 similar voting pattern precedents in past 5 years",
    market: {
      id: "oscars-editing",
      source: "polymarket",
      question: "Will technical drama win editing Oscar?",
      category: "Entertainment",
      marketProb: 62,
      volume: 120000,
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://polymarket.com",
      rawData: {},
    },
  },
  {
    id: "edge-crypto-002",
    category: "Crypto",
    event: "Ethereum L2 Fee Market: Arbitrage Opportunity vs Mainnet",
    blurb:
      "Arbitrum transaction costs diverged 40% above historical mean vs Ethereum mainnet despite identical network load metrics. Sequencer fee dynamics suggest temporary inefficiency. Reversion probability within 48 hours at 78% based on historical variance clustering patterns.",
    signals: ["fee-markets", "arbitrage", "layer-2-dynamics"],
    confidence: "B",
    marketProb: 58,
    aiProb: 65,
    aiProbLow: 60,
    aiProbHigh: 70,
    edge: 7,
    status: "active",
    outcome: null,
    detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    supportingStats: "ARB fees 40% above mean, network load identical to mainnet",
    similarSetups: "5 historical patterns with 78% reversion within 48h",
    market: {
      id: "arbitrum-fees",
      source: "polymarket",
      question: "Will ARB fees normalize within 48h?",
      category: "Crypto",
      marketProb: 58,
      volume: 95000,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://polymarket.com",
      rawData: {},
    },
  },
  {
    id: "edge-economy-002",
    category: "Economy",
    event: "Commodity Complex: Geopolitical Premium Miscalibrated Downward",
    blurb:
      "Forward spreads on energy commodities price 40bps of tail risk vs historical regime vol. Geopolitical event clustering in supply-critical regions not proportionally reflected in volatility skew. Tail hedges represent 12:1 risk/reward on sub-30 day positions through supply disruption scenarios.",
    signals: ["geopolitical-risk", "volatility-skew", "commodity-hedging"],
    confidence: "A",
    marketProb: 32,
    aiProb: 40,
    aiProbLow: 36,
    aiProbHigh: 44,
    edge: 8,
    status: "active",
    outcome: null,
    detectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    supportingStats: "Forward spreads pricing 40bps vs 200bps historical volatility",
    similarSetups: "Similar geopolitical clustering in 2022, 2020 cycles",
    market: {
      id: "crude-oil-april",
      source: "polymarket",
      question: "Will crude oil spike above $90/bbl in April?",
      category: "Economy",
      marketProb: 32,
      volume: 520000,
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://polymarket.com",
      rawData: {},
    },
  },
  {
    id: "edge-sports-001",
    category: "Sports",
    event: "College Basketball: Depth Charts Signal March Upset Potential",
    blurb:
      "Team A's backup center becomes available post-suspension; matchup data vs Team B's primary offensive sets shows 8.2% eFG differential. Tournament positioning creates line mispricings; sharps haven't fully rotated into updated foul trouble assumptions for elite guards.",
    signals: ["roster-changes", "matchup-analysis", "playoff-positioning"],
    confidence: "B+",
    marketProb: 70,
    aiProb: 62,
    aiProbLow: 58,
    aiProbHigh: 66,
    edge: 8,
    status: "active",
    outcome: null,
    detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    supportingStats: "Team A backup vs Team B setup: 8.2% eFG differential",
    similarSetups: "3 similar roster change scenarios in tournament history",
    market: {
      id: "march-madness-001",
      source: "polymarket",
      question: "Will Team A upset Team B in March?",
      category: "Sports",
      marketProb: 70,
      volume: 310000,
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://polymarket.com",
      rawData: {},
    },
  },
];

export function getMockEdges(
  category?: string,
  status?: string,
  sortBy?: string
): Edge[] {
  let filtered = [...MOCK_EDGES];

  if (category) {
    filtered = filtered.filter((edge) =>
      edge.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  if (status) {
    filtered = filtered.filter((edge) => edge.status === status);
  }

  if (sortBy) {
    switch (sortBy) {
      case "confidence":
        filtered.sort((a, b) => {
          const order: Record<string, number> = {
            "A+": 6,
            A: 5,
            "B+": 4,
            B: 3,
            "C+": 2,
            C: 1,
          };
          return (order[b.confidence] || 0) - (order[a.confidence] || 0);
        });
        break;
      case "recent":
        filtered.sort(
          (a, b) =>
            new Date(b.detectedAt).getTime() -
            new Date(a.detectedAt).getTime()
        );
        break;
      case "edge":
        filtered.sort((a, b) => b.edge - a.edge);
        break;
    }
  }

  return filtered;
}

export function getMockStats(): AggregateStats {
  return {
    totalSignals: MOCK_EDGES.length,
    activeSignals: MOCK_EDGES.filter((e) => e.status === "active").length,
    hits: MOCK_EDGES.filter((e) => e.outcome === "hit").length,
    misses: MOCK_EDGES.filter((e) => e.outcome === "miss").length,
    hitRate: 0,
    avgEdge:
      MOCK_EDGES.reduce((sum, e) => sum + e.edge, 0) / MOCK_EDGES.length,
    bestEdge: Math.max(...MOCK_EDGES.map((e) => e.edge), 0),
  };
}
