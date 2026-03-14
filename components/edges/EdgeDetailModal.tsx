"use client";

import { Edge } from "@/lib/types";
import { CategoryChip } from "@/components/ui/CategoryChip";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SignalList } from "@/components/ui/SignalList";
import { ProbabilityMeter } from "./ProbabilityMeter";

interface EdgeDetailModalProps {
  edge: Edge | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EdgeDetailModal({
  edge,
  isOpen,
  onClose,
}: EdgeDetailModalProps) {
  if (!isOpen || !edge) return null;

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status={edge.status} />
            <ConfidenceBadge grade={edge.confidence} />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Category and Title */}
          <div className="space-y-3">
            <CategoryChip category={edge.category} />
            <h1 className="text-2xl font-bold text-zinc-100">
              {edge.event}
            </h1>
          </div>

          {/* Edge Display */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4">
            <div className="text-sm text-zinc-500 uppercase tracking-wide mb-2">
              Edge Size
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-cyan-400">
                {edge.aiProb > edge.marketProb ? "+" : "-"}
                {Math.abs(edge.edge).toFixed(1)}%
              </span>
              <span className="text-zinc-400">
                ({edge.aiProb > edge.marketProb ? "AI higher" : "AI lower"})
              </span>
            </div>
          </div>

          {/* Probability Meter */}
          <div>
            <div className="text-sm text-zinc-500 uppercase tracking-wide mb-3">
              Probability Analysis
            </div>
            <ProbabilityMeter
              marketProb={edge.marketProb}
              aiProb={edge.aiProb}
              aiProbLow={edge.aiProbLow}
              aiProbHigh={edge.aiProbHigh}
            />
          </div>

          {/* Probability Range */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">
                Market Prob
              </div>
              <div className="text-lg font-bold text-zinc-300 mt-1">
                {edge.marketProb.toFixed(1)}%
              </div>
            </div>
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">
                AI Estimate Range
              </div>
              <div className="text-lg font-bold text-cyan-400 mt-1">
                {edge.aiProbLow.toFixed(1)}% — {edge.aiProbHigh.toFixed(1)}%
              </div>
            </div>
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">
                Central Estimate
              </div>
              <div className="text-lg font-bold text-cyan-400 mt-1">
                {edge.aiProb.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Full Blurb */}
          <div className="space-y-2">
            <div className="text-sm text-zinc-500 uppercase tracking-wide">
              Analyst Reasoning
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {edge.blurb}
            </p>
          </div>

          {/* Signals */}
          {edge.signals && edge.signals.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm text-zinc-500 uppercase tracking-wide">
                Supporting Signals
              </div>
              <SignalList signals={edge.signals} />
            </div>
          )}

          {/* Supporting Stats */}
          {edge.supportingStats && (
            <div className="space-y-2">
              <div className="text-sm text-zinc-500 uppercase tracking-wide">
                Supporting Stats
              </div>
              <div className="text-sm text-zinc-300 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 whitespace-pre-wrap">
                {edge.supportingStats}
              </div>
            </div>
          )}

          {/* Similar Setups */}
          {edge.similarSetups && (
            <div className="space-y-2">
              <div className="text-sm text-zinc-500 uppercase tracking-wide">
                Similar Historical Setups
              </div>
              <div className="text-sm text-zinc-300 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 whitespace-pre-wrap">
                {edge.similarSetups}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-zinc-800 pt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-zinc-500 uppercase tracking-wide text-xs">
                Detected
              </div>
              <div className="text-zinc-300 mt-1">
                {new Date(edge.detectedAt).toLocaleDateString()} at{" "}
                {new Date(edge.detectedAt).toLocaleTimeString()}
              </div>
            </div>
            {edge.resolvedAt && (
              <div>
                <div className="text-zinc-500 uppercase tracking-wide text-xs">
                  Resolved
                </div>
                <div className="text-zinc-300 mt-1">
                  {new Date(edge.resolvedAt).toLocaleDateString()} at{" "}
                  {new Date(edge.resolvedAt).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>

          {/* Market Link */}
          <div className="border-t border-zinc-800 pt-4">
            <a
              href={edge.market.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-colors font-medium text-sm"
            >
              View Market
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
    </div>
  );
}
