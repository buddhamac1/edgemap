"use client";

import { useState } from "react";
import { Edge } from "@/lib/types";
import { CategoryChip } from "@/components/ui/CategoryChip";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { ProbabilityMeter } from "./ProbabilityMeter";

interface EdgeCardProps {
  edge: Edge;
  onClick?: () => void;
}

export function EdgeCard({ edge, onClick }: EdgeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const relativeTime = getRelativeTime(new Date(edge.detectedAt));

  const truncateText = (text: string, lines: number) => {
    const lineArray = text.split("\n");
    if (lineArray.length > lines) {
      return lineArray.slice(0, lines).join("\n") + "...";
    }
    return text;
  };

  const handleViewDetails = () => {
    onClick?.();
  };

  return (
    <div
      className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-5 space-y-4 hover:border-zinc-700 transition-colors duration-200"
      role="article"
    >
      {/* Header: Category and Confidence */}
      <div className="flex items-start justify-between gap-4">
        <CategoryChip category={edge.category} />
        <ConfidenceBadge grade={edge.confidence} />
      </div>

      {/* Event/Question */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2">
          {edge.event}
        </h3>
      </div>

      {/* Probability Meter */}
      <div>
        <ProbabilityMeter
          marketProb={edge.marketProb}
          aiProb={edge.aiProb}
          aiProbLow={edge.aiProbLow}
          aiProbHigh={edge.aiProbHigh}
        />
      </div>

      {/* Edge Size Prominent Display */}
      <div className="flex items-center gap-2">
        <div className="text-lg font-bold text-cyan-400">
          {edge.aiProb > edge.marketProb ? "+" : "-"}
          {Math.abs(edge.edge).toFixed(1)}% edge
        </div>
        {edge.status === "active" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        )}
      </div>

      {/* Blurb with expand toggle */}
      <div>
        <p className="text-sm text-zinc-400 line-clamp-3">
          {isExpanded ? edge.blurb : truncateText(edge.blurb, 3)}
        </p>
        {edge.blurb.split("\n").length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 font-medium transition-colors"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Footer: Detected time, View Details button, and external link */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-800">
        <span className="text-xs text-zinc-500">{relativeTime}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleViewDetails}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-colors duration-200"
          >
            View Details
          </button>
          <a
            href={edge.market.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-cyan-400 transition-colors duration-200"
            aria-label="Open market in new tab"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-6l6-6m0 0V5m0-1H9"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}
