import Anthropic from "@anthropic-ai/sdk";
import { Market, EdgeAnalysis } from "./types";

const client = new Anthropic();

const ANALYSIS_PROMPT = `You are an expert prediction market analyst and quantitative handicapper. You identify mispriced markets by combining statistical analysis, situational factors, and historical patterns.

Given this prediction market:
- Question: {question}
- Current market implied probability: {marketProb}%
- Category: {category}
- Market volume: ${"{volume}"}
- Resolution date: {endDate}

Analyze whether this market is mispriced. Consider:
1. Base rates and historical data for similar events
2. Current situational factors the market may not be pricing in
3. Known biases in prediction markets (favorite-longshot bias, recency bias, etc.)
4. Any structural reasons the market could be slow to update

If you detect a meaningful edge (5%+ difference between market price and your estimated true probability), provide your analysis.

Respond in JSON format ONLY (no markdown, no code fences):
{
  "hasEdge": boolean,
  "estimatedProbability": number (0-100),
  "probabilityRangeLow": number,
  "probabilityRangeHigh": number,
  "confidence": "A+" | "A" | "B+" | "B" | "C+" | "C",
  "blurb": "One sharp paragraph explaining the edge. Be specific. Reference real data points, stats, and situational factors. Sound like a smart handicapper, not a generic AI. No hedging language.",
  "signals": ["signal 1", "signal 2", "signal 3"],
  "supportingStats": "Key statistical backing for the edge",
  "similarSetups": "Historical analog or comparable situation"
}

Confidence grading:
- A+: Multiple strong independent signals, clear historical precedent, high conviction
- A: Strong signal with good data support, some uncertainty
- B+: Moderate signal, reasonable data but some ambiguity
- B: Weak signal, limited data, speculative but plausible
- C+/C: Marginal, worth watching but low conviction

If no meaningful edge exists, respond: { "hasEdge": false }

CRITICAL STYLE RULES FOR THE BLURB:
- Be specific. Use numbers, names, dates.
- Sound like a sharp analyst, not a cautious AI.
- No phrases like "it's worth noting" or "it remains to be seen"
- Reference concrete data: win-loss records, percentages, dollar amounts, polling numbers
- Keep it to 2-3 sentences max
- Make the reader feel like they're getting insider-level insight`;

function buildPrompt(market: Market): string {
  return ANALYSIS_PROMPT.replace("{question}", market.question)
    .replace("{marketProb}", market.marketProb.toString())
    .replace("{category}", market.category)
    .replace("{volume}", `$${market.volume.toLocaleString()}`)
    .replace("{endDate}", market.endDate || "TBD");
}

export async function analyzeMarket(
  market: Market
): Promise<EdgeAnalysis | null> {
  try {
    const prompt = buildPrompt(market);

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    // Extract text from response
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    const raw = textBlock.text.trim();

    // Parse JSON — handle potential markdown code fences
    const jsonStr = raw.replace(/^```json?\s*/, "").replace(/\s*```$/, "");
    const analysis = JSON.parse(jsonStr);

    if (!analysis.hasEdge) return null;

    // Validate required fields
    if (
      typeof analysis.estimatedProbability !== "number" ||
      !analysis.confidence ||
      !analysis.blurb
    ) {
      console.error("Invalid analysis response shape", analysis);
      return null;
    }

    return {
      hasEdge: true,
      estimatedProbability: analysis.estimatedProbability,
      probabilityRangeLow: analysis.probabilityRangeLow ?? analysis.estimatedProbability - 5,
      probabilityRangeHigh: analysis.probabilityRangeHigh ?? analysis.estimatedProbability + 5,
      confidence: analysis.confidence,
      blurb: analysis.blurb,
      signals: analysis.signals || [],
      supportingStats: analysis.supportingStats || "",
      similarSetups: analysis.similarSetups || "",
    };
  } catch (error) {
    console.error(`Claude analysis failed for market ${market.id}:`, error);
    return null;
  }
}
