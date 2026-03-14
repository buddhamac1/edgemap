'use client';

import { useState, useEffect } from 'react';

interface TopBarProps {
  title: string;
  edgeCount?: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  edgeCount = 0,
  searchQuery,
  onSearchChange,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-edge-bg/80 backdrop-blur-sm border-b border-edge-border">
      <div className="flex items-center justify-between px-6 py-4 md:py-5">
        {/* Left: Title and Edge Count */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-edge-text">
              {title}
            </h1>
          </div>

          {/* Active Edges Badge */}
          {edgeCount > 0 && (
            <div
              className="px-3 py-1 bg-edge-accent/20 border border-edge-accent rounded-full"
              role="status"
              aria-label={`${edgeCount} active edges`}
            >
              <span className="text-sm font-semibold text-edge-accent">
                {edgeCount} active
              </span>
            </div>
          )}
        </div>

        {/* Right: Search Input */}
        <div className="flex-1 max-w-xs md:max-w-md ml-auto">
          <div className="relative">
            <input
              type="search"
              placeholder="Search edges..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 bg-edge-card border border-edge-border rounded-lg text-edge-text placeholder-edge-dim focus:outline-none focus:ring-2 focus:ring-edge-accent focus:border-transparent transition-all text-sm"
              aria-label="Search edges"
            />
            {/* Search Icon */}
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-edge-dim pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
