"use client";

import { useEffect, useState } from "react";
import { MarketCategory } from "@/lib/types";
import { ALL_CATEGORIES, CATEGORY_COLORS } from "@/lib/constants";

interface CategoryFollowProps {
  onCategoriesChange: (categories: MarketCategory[]) => void;
}

const CATEGORY_FOLLOW_STORAGE_KEY = "edgemap_followed_categories";

export function CategoryFollow({ onCategoriesChange }: CategoryFollowProps) {
  const [followedCategories, setFollowedCategories] = useState<
    Set<MarketCategory>
  >(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load followed categories from localStorage on mount
  useEffect(() => {
    setIsLoading(true);
    const stored = localStorage.getItem(CATEGORY_FOLLOW_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFollowedCategories(new Set(parsed));
      } catch (e) {
        console.error("Failed to parse followed categories:", e);
        setFollowedCategories(new Set());
      }
    } else {
      // Default: follow all categories
      setFollowedCategories(new Set(ALL_CATEGORIES));
    }
    setIsLoading(false);
  }, []);

  // Notify parent when categories change
  useEffect(() => {
    if (!isLoading) {
      onCategoriesChange([...followedCategories]);
    }
  }, [followedCategories, isLoading, onCategoriesChange]);

  const toggleCategory = (category: MarketCategory) => {
    const newSet = new Set(followedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setFollowedCategories(newSet);
    localStorage.setItem(
      CATEGORY_FOLLOW_STORAGE_KEY,
      JSON.stringify([...newSet])
    );
  };

  const toggleAll = () => {
    if (followedCategories.size === ALL_CATEGORIES.length) {
      setFollowedCategories(new Set());
      localStorage.setItem(CATEGORY_FOLLOW_STORAGE_KEY, JSON.stringify([]));
    } else {
      setFollowedCategories(new Set(ALL_CATEGORIES));
      localStorage.setItem(
        CATEGORY_FOLLOW_STORAGE_KEY,
        JSON.stringify(ALL_CATEGORIES)
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-zinc-500 text-sm">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wide">
          Follow Categories
        </h3>
        <button
          onClick={toggleAll}
          className="text-xs px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors"
        >
          {followedCategories.size === ALL_CATEGORIES.length
            ? "Clear All"
            : "Select All"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {ALL_CATEGORIES.map((category) => {
          const isFollowed = followedCategories.has(category);
          const colorClass = CATEGORY_COLORS[category];

          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                isFollowed
                  ? colorClass
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700"
              }`}
            >
              {isFollowed && <span className="mr-1">✓</span>}
              {category}
            </button>
          );
        })}
      </div>

      <div className="text-xs text-zinc-500 pt-2">
        Following {followedCategories.size} of {ALL_CATEGORIES.length}{" "}
        categories
      </div>
    </div>
  );
}
