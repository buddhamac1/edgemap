"use client";

import { CATEGORY_COLORS } from "@/lib/constants";
import { MarketCategory } from "@/lib/types";

interface CategoryChipProps {
  category: MarketCategory;
}

export function CategoryChip({ category }: CategoryChipProps) {
  const colorClass = CATEGORY_COLORS[category];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
    >
      {category}
    </span>
  );
}
