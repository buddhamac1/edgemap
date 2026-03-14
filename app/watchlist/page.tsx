'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MobileNav from '@/components/layout/MobileNav';
import { EdgeCard } from '@/components/edges/EdgeCard';
import { ALL_CATEGORIES } from '@/lib/constants';
import { Edge } from '@/lib/types';
import { getMockEdges } from '@/data/mock-edges';

export default function WatchlistPage() {
  const pathname = usePathname();
  const [edges, setEdges] = useState<Edge[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // Load watchlist from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('watchlist');
    if (stored) {
      setWatchlistIds(new Set(JSON.parse(stored)));
    }
  }, []);

  // Fetch edges
  useEffect(() => {
    const fetchEdges = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/edges');
        if (response.ok) {
          const data = await response.json();
          setEdges(data);
        } else {
          setEdges(getMockEdges());
        }
      } catch (error) {
        console.error('Failed to fetch edges:', error);
        setEdges(getMockEdges());
      } finally {
        setLoading(false);
      }
    };

    fetchEdges();
  }, []);

  // Filter to watchlisted edges
  const watchlistedEdges = edges
    .filter((edge) => watchlistIds.has(edge.id))
    .filter((edge) => {
      if (selectedCategory !== 'All' && edge.category !== selectedCategory) {
        return false;
      }
      if (
        searchQuery &&
        !edge.event.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

  const toggleWatchlist = (edgeId: string) => {
    const newWatchlist = new Set(watchlistIds);
    if (newWatchlist.has(edgeId)) {
      newWatchlist.delete(edgeId);
    } else {
      newWatchlist.add(edgeId);
    }
    setWatchlistIds(newWatchlist);
    localStorage.setItem('watchlist', JSON.stringify([...newWatchlist]));
  };

  return (
    <div className="flex h-screen bg-[#09090b]">
      {/* Sidebar */}
      <Sidebar activePath={pathname} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden md:pb-0 pb-20">
        {/* Top Bar */}
        <TopBar
          title="Watchlist"
          edgeCount={watchlistedEdges.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Category Filter Tabs */}
        <div className="sticky top-16 z-30 bg-[#09090b]/80 backdrop-blur-sm border-b border-[#27272a] px-6 py-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-[#27272a] text-[#a1a1a6] hover:text-[#f4f4f5]'
              }`}
            >
              All
            </button>
            {ALL_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-[#27272a] text-[#a1a1a6] hover:text-[#f4f4f5]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl">
            <h2 className="text-lg font-semibold text-[#f4f4f5] mb-6">
              {watchlistedEdges.length} edges in watchlist
            </h2>

            {loading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#18181b] border border-[#27272a] rounded-lg p-5 animate-pulse"
                  >
                    <div className="h-4 bg-[#27272a] rounded w-1/3 mb-4"></div>
                    <div className="h-3 bg-[#27272a] rounded w-full mb-2"></div>
                    <div className="h-3 bg-[#27272a] rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            )}

            {!loading && watchlistedEdges.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[#a1a1a6] text-lg">
                  No edges in your watchlist
                </p>
                <p className="text-[#52525b] text-sm mt-2">
                  Add edges to your watchlist to track them here
                </p>
              </div>
            )}

            {!loading && watchlistedEdges.length > 0 && (
              <div className="grid gap-4">
                {watchlistedEdges.map((edge) => (
                  <div key={edge.id} className="relative">
                    <EdgeCard
                      edge={edge}
                      onClick={() => setSelectedEdge(edge)}
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWatchlist(edge.id);
                      }}
                      className="absolute top-4 right-4 p-2 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-yellow-400 transition-colors"
                      title="Remove from watchlist"
                    >
                      <svg
                        className="w-5 h-5 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav activePath={pathname} />

      {/* Edge Detail Modal */}
      {selectedEdge && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEdge(null)}
        >
          <div
            className="bg-[#18181b] border border-[#27272a] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#18181b]/95 border-b border-[#27272a] p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#f4f4f5]">Edge Details</h2>
              <button
                onClick={() => setSelectedEdge(null)}
                className="text-[#a1a1a6] hover:text-[#f4f4f5] transition-colors"
              >
                <svg
                  className="w-6 h-6"
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

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-[#27272a] text-[#a1a1a6] rounded-full text-sm font-medium">
                  {selectedEdge.category}
                </span>
                <button
                  onClick={() => toggleWatchlist(selectedEdge.id)}
                  className="ml-auto p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                  title="Remove from watchlist"
                >
                  <svg
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#f4f4f5] mb-2">
                  {selectedEdge.event}
                </h3>
              </div>

              <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4">
                <p className="text-[#a1a1a6] text-sm mb-2">Edge Size</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {selectedEdge.aiProb > selectedEdge.marketProb ? '+' : '-'}
                  {Math.abs(selectedEdge.edge).toFixed(1)}%
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4">
                  <p className="text-[#a1a1a6] text-sm mb-2">Market Probability</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {selectedEdge.marketProb.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4">
                  <p className="text-[#a1a1a6] text-sm mb-2">AI Probability</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {selectedEdge.aiProb.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4">
                <h4 className="text-[#f4f4f5] font-semibold mb-3">Analysis</h4>
                <p className="text-[#a1a1a6] text-sm leading-relaxed">
                  {selectedEdge.blurb}
                </p>
              </div>

              <a
                href={selectedEdge.market.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg font-semibold text-center hover:bg-cyan-500/30 transition-colors"
              >
                View on {selectedEdge.market.source === 'polymarket' ? 'Polymarket' : 'Kalshi'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
