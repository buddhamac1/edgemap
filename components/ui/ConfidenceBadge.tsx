"use client";

import { CONFIDENCE_COLORS } from "@/lib/constants";
import { ConfidenceGrade } from "@/lib/types";

interface ConfidenceBadgeProps {
  grade: ConfidenceGrade;
}

export function ConfidenceBadge({ grade }: ConfidenceBadgeProps) {
  const colorClass = CONFIDENCE_COLORS[grade];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
    >
      {grade}
    </span>
  );
}
