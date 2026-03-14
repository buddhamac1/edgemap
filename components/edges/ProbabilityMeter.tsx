"use client";

interface ProbabilityMeterProps {
  marketProb: number;
  aiProb: number;
  aiProbLow?: number;
  aiProbHigh?: number;
}

export function ProbabilityMeter({
  marketProb,
  aiProb,
  aiProbLow,
  aiProbHigh,
}: ProbabilityMeterProps) {
  const clamp = (val: number) => Math.max(0, Math.min(100, val));
  const market = clamp(marketProb);
  const ai = clamp(aiProb);
  const low = clamp(aiProbLow ?? ai - 5);
  const high = clamp(aiProbHigh ?? ai + 5);

  const edge = Math.abs(ai - market);
  const isAiHigher = ai > market;

  return (
    <div className="w-full space-y-3">
      <div className="relative h-16 bg-zinc-900 rounded-lg border border-zinc-800 p-3">
        {/* Background bar */}
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center px-3">
          <div className="w-full h-1 bg-zinc-800 rounded-full" />
        </div>

        {/* AI probability range (if provided) */}
        {aiProbLow !== undefined && aiProbHigh !== undefined && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-6 bg-cyan-400/10 border border-cyan-400/30 rounded"
            style={{
              left: `${(low / 100) * 100}%`,
              right: `${100 - (high / 100) * 100}%`,
              minWidth: "4px",
            }}
          />
        )}

        {/* Market probability marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${market}%` }}
        >
          <div className="w-3 h-3 bg-zinc-400 rounded-full border-2 border-zinc-300" />
          <div className="text-xs font-semibold text-zinc-300 mt-1 whitespace-nowrap">
            {market.toFixed(1)}%
          </div>
        </div>

        {/* AI probability marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${ai}%` }}
        >
          <div
            className={`w-3 h-3 rounded-full border-2 ${
              isAiHigher
                ? "bg-emerald-400 border-emerald-400"
                : "bg-red-400 border-red-400"
            }`}
          />
          <div
            className={`text-xs font-semibold mt-1 whitespace-nowrap ${
              isAiHigher ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {ai.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Labels and edge display */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-xs text-zinc-500 uppercase tracking-wide">
            Market
          </div>
          <div className="text-sm font-medium text-zinc-300">
            {market.toFixed(1)}%
          </div>
        </div>

        <div className="flex-1 text-center">
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${
              isAiHigher
                ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/50"
                : "bg-red-400/10 text-red-400 border-red-400/50"
            }`}
          >
            <span>
              {isAiHigher ? "+" : "-"}
              {edge.toFixed(1)}%
            </span>
            <span className="text-zinc-500">edge</span>
          </div>
        </div>

        <div className="flex-1 text-right">
          <div className="text-xs text-zinc-500 uppercase tracking-wide">
            AI Estimate
          </div>
          <div className="text-sm font-medium text-cyan-400">
            {ai.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
