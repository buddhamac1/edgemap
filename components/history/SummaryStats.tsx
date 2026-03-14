"use client";

import { AggregateStats } from "@/lib/types";

interface SummaryStatsProps {
  stats: AggregateStats;
}

export function SummaryStats({ stats }: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Signals */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 space-y-1">
        <div className="text-xs text-zinc-500 uppercase tracking-wide">
          Total Signals
        </div>
        <div className="text-3xl font-bold text-cyan-400">
          {stats.totalSignals}
        </div>
        <div className="text-xs text-zinc-500">
          {stats.activeSignals} active
        </div>
      </div>

      {/* Hit Rate */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 space-y-1">
        <div className="text-xs text-zinc-500 uppercase tracking-wide">
          Hit Rate
        </div>
        <div className="text-3xl font-bold text-emerald-400">
          {(stats.hitRate * 100).toFixed(1)}%
        </div>
        <div className="text-xs text-zinc-500">
          {stats.hits} hits, {stats.misses} misses
        </div>
      </div>

      {/* Average Edge */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 space-y-1">
        <div className="text-xs text-zinc-500 uppercase tracking-wide">
          Average Edge
        </div>
        <div className="text-3xl font-bold text-cyan-400">
          {stats.avgEdge.toFixed(1)}%
        </div>
        <div className="text-xs text-zinc-500">
          Across all resolved edges
        </div>
      </div>

      {/* Best Edge */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 space-y-1">
        <div className="text-xs text-zinc-500 uppercase tracking-wide">
          Best Edge
        </div>
        <div className="text-3xl font-bold text-emerald-400">
          {stats.bestEdge.toFixed(1)}%
        </div>
        <div className="text-xs text-zinc-500">
          Maximum detected
        </div>
      </div>
    </div>
  );
}
