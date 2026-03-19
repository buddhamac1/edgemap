import { NextResponse } from "next/server";
import { fetchMarkets } from "@/lib/polymarket";
import { analyzeMarket } from "@/lib/claude";
import { getAnalysisCache } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const log: string[] = [];
  const t0 = Date.now();

  try {
    // Step 1: fetch markets
    log.push("Fetching markets...");
    const markets = await fetchMarkets({ forceRefresh: true, limit: 500 });
    log.push(`Got ${markets.length} markets after filters`);

    if (markets.length === 0) {
      return NextResponse.json({ log, error: "No markets returned" });
    }

    // Step 2: pick first market and check cache
    const market = markets[0];
    log.push(`Testing market: "${market.question}" prob=${market.marketProb}% vol=${market.volume}`);

    const cached = await getAnalysisCache(market.id);
    log.push(`Cache: ${cached ? "HIT (timestamp=" + cached.timestamp + ")" : "MISS"}`);

    // Step 3: call Claude directly
    log.push("Calling Claude...");
    const claudeT0 = Date.now();
    const analysis = await analyzeMarket(market);
    const claudeMs = Date.now() - claudeT0;
    log.push(`Claude returned in ${claudeMs}ms: ${JSON.stringify(analysis)?.substring(0, 200)}`);

    return NextResponse.json({
      totalMs: Date.now() - t0,
      log,
      market: { question: market.question, prob: market.marketProb, vol: market.volume },
      analysis,
    });
  } catch (err) {
    log.push(`ERROR: ${err instanceof Error ? err.message : String(err)}`);
    return NextResponse.json({ totalMs: Date.now() - t0, log, error: String(err) }, { status: 500 });
  }
  }
