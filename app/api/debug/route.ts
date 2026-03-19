import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchMarkets } from "@/lib/polymarket";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const log: string[] = [];

  try {
    // Test 1: check API key exists
    const apiKey = process.env.ANTHROPIC_API_KEY;
    log.push(`API key present: ${!!apiKey} (length: ${apiKey?.length ?? 0})`);

    // Test 2: fetch markets
    const markets = await fetchMarkets({ forceRefresh: true, limit: 500 });
    log.push(`Markets fetched: ${markets.length}`);

    if (markets.length === 0) {
      return NextResponse.json({ log, error: "No markets" });
    }

    const market = markets[0];
    log.push(`Market: "${market.question.substring(0, 60)}" prob=${market.marketProb}%`);

    // Test 3: direct Anthropic API call with tiny prompt
    const client = new Anthropic({ apiKey });
    log.push("Calling Anthropic SDK directly...");
    const t0 = Date.now();

    let claudeError: string | null = null;
    let claudeResult: string | null = null;

    try {
      const msg = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 50,
        messages: [{ role: "user", content: "Reply with just the word PONG" }],
      });
      const elapsed = Date.now() - t0;
      claudeResult = `OK in ${elapsed}ms: ${JSON.stringify(msg.content)}`;
    } catch (err: unknown) {
      const elapsed = Date.now() - t0;
      const e = err as { status?: number; message?: string; error?: unknown };
      claudeError = `FAILED in ${elapsed}ms | status=${e.status} | message=${e.message} | error=${JSON.stringify(e.error)}`;
    }

    log.push(claudeError ?? claudeResult ?? "no result");

    return NextResponse.json({ log });
  } catch (err) {
    log.push(`OUTER ERROR: ${String(err)}`);
    return NextResponse.json({ log }, { status: 500 });
  }
}
