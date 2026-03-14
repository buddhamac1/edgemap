"use client";

import { Edge } from "@/lib/types";
import { CategoryChip } from "@/components/ui/CategoryChip";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";

interface PerformanceTableProps {
  edges: Edge[];
}

export function PerformanceTable({ edges }: PerformanceTableProps) {
  // Filter only resolved edges
  const resolvedEdges = edges.filter((e) => e.status === "resolved");

  if (resolvedEdges.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        No resolved edges yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-zinc-800 rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-900 border-b border-zinc-800">
            <th className="px-4 py-3 text-left font-semibold text-zinc-300">
              Event
            </th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-300">
              Category
            </th>
            <th className="px-4 py-3 text-center font-semibold text-zinc-300">
              Market %
            </th>
            <th className="px-4 py-3 text-center font-semibold text-zinc-300">
              AI %
            </th>
            <th className="px-4 py-3 text-center font-semibold text-zinc-300">
              Edge
            </th>
            <th className="px-4 py-3 text-center font-semibold text-zinc-300">
              Confidence
            </th>
            <th className="px-4 py-3 text-center font-semibold text-zinc-300">
              Outcome
            </th>
          </tr>
        </thead>
        <tbody>
          {resolvedEdges.map((edge, index) => (
            <tr
              key={edge.id}
              className={`border-b border-zinc-800 ${
                index % 2 === 0 ? "bg-zinc-950/50" : "bg-zinc-900/30"
              } hover:bg-zinc-900/60 transition-colors`}
            >
              <td className="px-4 py-3 text-zinc-100 font-medium max-w-xs truncate">
                {edge.event}
              </td>
              <td className="px-4 py-3">
                <CategoryChip category={edge.category} />
              </td>
              <td className="px-4 py-3 text-center text-zinc-300">
                {edge.marketProb.toFixed(1)}%
              </td>
              <td className="px-4 py-3 text-center text-cyan-400 font-medium">
                {edge.aiProb.toFixed(1)}%
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    edge.aiProb > edge.marketProb
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {edge.aiProb > edge.marketProb ? "+" : "-"}
                  {Math.abs(edge.edge).toFixed(1)}%
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <ConfidenceBadge grade={edge.confidence} />
              </td>
              <td className="px-4 py-3 text-center">
                {edge.outcome === "hit" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ✓ Hit
                  </span>
                )}
                {edge.outcome === "miss" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                    ✗ Miss
                  </span>
                )}
                {edge.outcome === null && (
                  <span className="text-zinc-500 text-xs">Pending</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
