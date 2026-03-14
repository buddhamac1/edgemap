"use client";

import { useEffect, useState } from "react";
import { Edge } from "@/lib/types";
import { EdgeCard } from "@/components/edges/EdgeCard";

interface WatchlistViewProps {
  allEdges: Edge[];
}

const WATCHLIST_STORAGE_KEY = "edgemap_watchlist";

export function WatchlistView({ allEdges }: WatchlistViewProps) {
  const [watchlistedIds, setWatchlistedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    setIsLoading(true);
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setWatchlistedIds(new Set(parsed));
      } catch (e) {
        console.error("Failed to parse watchlist:", e);
        setWatchlistedIds(new Set());
      }
    }
    setIsLoading(false);
  }, []);

  const watchlistedEdges = allEdges.filter((edge) =>
    watchlistedIds.has(edge.id)
  );

  const toggleWatchlist = (edgeId: string) => {
    const newSet = new Set(watchlistedIds);
    if (newSet.has(edgeId)) {
      newSet.delete(edgeId);
    } else {
      newSet.add(edgeId);
    }
    setWatchlistedIds(newSet);
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify([...newSet]));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500">Loading watchlist...</div>
      </div>
    );
  }

  if (watchlistedEdges.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold text-zinc-300">
            Your watchlist is empty
          </div>
          <p className="text-sm text-zinc-500">
            Add edges to your watchlist to track them here. Click the star icon
            on any edge card to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">
            Your Watchlist
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            {watchlistedEdges.length} edge{watchlistedEdges.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {watchlistedEdges.map((edge) => (
          <div key={edge.id} className="relative group">
            <EdgeCard
              edge={edge}
              onClick={() => setSelectedEdge(edge)}
            />
            <button
              onClick={() => toggleWatchlist(edge.id)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-yellow-400 hover:text-yellow-300 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Remove from watchlist"
              title="Remove from watchlist"
            >
              ★
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
