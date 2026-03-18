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

  // Determine bet direction: YES if AI thinks prob is higher than market, NO if lower
  const betYes = edge.aiProb > edge.marketProb;
  const edgeMagnitude = Math.abs(edge.edge);

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

      {/* Market Question — the actual Polymarket question, front and center */}
      <div>
        <h3 className="text-base font-semibold text-zinc-100 leading-snug">
          {edge.market.question}
        </h3>
        {/* AI analysis label as subtle secondary line */}
        {edge.event !== edge.market.question && (
          <p className="text-xs text-zinc-500 mt-1 italic">{edge.event}</p>
        )}
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

      {/* Edge call: BET YES / BET NO with magnitude */}
      <div className="flex items-center gap-3">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm ${
            betYes
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/15 text-red-400 border border-red-500/30"
          }`}
        >
          <span>{betYes ? "▲ BET YES" : "▼ BET NO"}</span>
          <span className="text-xs font-semibold opacity-80">
            +{edgeMagnitude.toFixed(1)}% edge
          </span>
        </div>
        {edge.status === "active" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
            Active
          </span>
        )}
      </div>

      {/* Blurb */}
      <div>
        <p
          className={`text-sm text-zinc-400 ${
            isExpanded ? "" : "line-clamp-2"
          }`}
        >
          {edge.blurb}
        </p>
        {edge.blurb.length > 120 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 font-medium transition-colors"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Footer */}
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
            aria-label="Open market on Polymarket"
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
