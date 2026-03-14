"use client";

import { useMemo } from "react";
import { Edge, EdgeFilters } from "@/lib/types";
import { CONFIDENCE_ORDER } from "@/lib/constants";
import { EdgeCard } from "./EdgeCard";

interface EdgeListProps {
  edges: Edge[];
  filters: EdgeFilters;
  onEdgeClick: (edge: Edge) => void;
}

export function EdgeList({ edges, filters, onEdgeClick }: EdgeListProps) {
  const filteredAndSortedEdges = useMemo(() => {
    let result = [...edges];

    // Filter by category
    if (filters.category && filters.category !== "All") {
      result = result.filter((edge) => edge.category === filters.category);
    }

    // Filter by minimum confidence
    if (filters.minConfidence) {
      const minConfidenceLevel = CONFIDENCE_ORDER[filters.minConfidence];
      result = result.filter(
        (edge) => CONFIDENCE_ORDER[edge.confidence] >= minConfidenceLevel
      );
    }

    // Filter by status
    if (filters.status && filters.status !== "all") {
      result = result.filter((edge) => edge.status === filters.status);
    }

    // Filter by search text (matches question/event)
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((edge) =>
        edge.event.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    const sortBy = filters.sortBy || "recency";
    const sortOrder = filters.sortOrder || "desc";

    switch (sortBy) {
      case "edge":
        result.sort((a, b) => b.edge - a.edge);
        break;
      case "confidence":
        result.sort((a, b) => {
          const aLevel = CONFIDENCE_ORDER[a.confidence];
          const bLevel = CONFIDENCE_ORDER[b.confidence];
          return bLevel - aLevel;
        });
        break;
      case "volume":
        result.sort((a, b) => b.market.volume - a.market.volume);
        break;
      case "recency":
      default:
        result.sort(
          (a, b) =>
            new Date(b.detectedAt).getTime() -
            new Date(a.detectedAt).getTime()
        );
        break;
    }

    // Apply sort order
    if (sortOrder === "asc") {
      result.reverse();
    }

    return result;
  }, [edges, filters]);

  if (filteredAndSortedEdges.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold text-zinc-300">
            No edges found
          </div>
          <p className="text-sm text-zinc-500">
            Try adjusting your filters or check back later for new opportunities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {filteredAndSortedEdges.map((edge) => (
        <EdgeCard
          key={edge.id}
          edge={edge}
          onClick={() => onEdgeClick(edge)}
        />
      ))}
    </div>
  );
}
