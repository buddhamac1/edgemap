'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MobileNav from '@/components/layout/MobileNav';
import { EdgeCard } from '@/components/edges/EdgeCard';
import { CategoryChip } from '@/components/ui/CategoryChip';
import { SortDropdown } from '@/components/ui/SortDropdown';
import { ALL_CATEGORIES } from '@/lib/constants';
import { Edge, AggregateStats } from '@/lib/types';
import { getMockEdges } from '@/data/mock-edges';

export default function Dashboard() {
  const pathname = usePathname();
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'edge' | 'confidence' | 'recency'>('edge');
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [lastScan, setLastScan] = useState<string>('');

  // Fetch edges from API — extracted so handleScanNow can call it too
  const fetchEdges = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchEdges();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchEdges, 60000);
    return () => clearInterval(interval);
  }, [fetchEdges]);

  // Calculate stats
  useEffect(() => {
    if (edges.length > 0) {
      const activeEdges = edges.filter((e) => e.status === 'active');
      const hits = edges.filter((e) => e.outcome === 'hit').length;
      const misses = edges.filter((e) => e.outcome === 'miss').length;
      setStats({
        totalSignals: edges.length,
        activeSignals: activeEdges.length,
        hits,
        misses,
        hitRate: edges.length > 0 ? (hits / (hits + misses)) * 100 : 0,
        avgEdge: edges.reduce((sum, e) => sum + e.edge, 0) / edges.length || 0,
        bestEdge: Math.max(...edges.map((e) => e.edge), 0),
      });
    } else {
      setStats(null);
    }
  }, [edges]);

  // Filter and sort edges
  const filteredEdges = edges
    .filter((edge) => {
      if (selectedCategory !== 'All' && edge.category !== selectedCategory) {
        return false;
      }
      if (
        searchQuery &&
        !edge.event.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !edge.blurb.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.edge - a.edge;
        case 'recency':
          return (
            new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
          );
        case 'edge':
        default:
          return b.edge - a.edge;
      }
    });

  const handleScanNow = async () => {
    setScanning(true);
    try {
      const response = await fetch('/api/scan', { method: 'POST' });
      if (response.ok) {
        // Re-fetch from /api/edges so we always show current storage state
        // (with mock fallback if scan found 0 real edges)
        await fetchEdges();
        setLastScan(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#09090b]">
      {/* Sidebar */}
      <Sidebar
        activePath={pathname}
        onScanNow={handleScanNow}
        lastScan={lastScan}
        scanning={scanning}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden md:pb-0 pb-20">
        {/* Top Bar */}
        <TopBar
          title="Dashboard"
          edgeCount={stats?.activeSignals || 0}
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
            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                  <p className="text-[#a1a1a6] text-sm font-medium mb-1">
                    Total Edges
                  </p>
                  <p className="text-2xl font-bold text-[#f4f4f5]">
                    {stats.totalSignals}
                  </p>
                </div>
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                  <p className="text-[#a1a1a6] text-sm font-medium mb-1">
                    Active
                  </p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {stats.activeSignals}
                  </p>
                </div>
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                  <p className="text-[#a1a1a6] text-sm font-medium mb-1">
                    Hit Rate
                  </p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {isNaN(stats.hitRate) ? '—' : `${stats.hitRate.toFixed(1)}%`}
                  </p>
                </div>
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                  <p className="text-[#a1a1a6] text-sm font-medium mb-1">
                    Avg Edge
                  </p>
                  <p className="text-2xl font-bold text-orange-400">
                    {stats.avgEdge.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            {/* Sort Dropdown and Results */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f4f4f5]">
                {scanning ? (
                  <span className="text-[#a1a1a6] animate-pulse">Scanning Polymarket…</span>
                ) : (
                  `${filteredEdges.length} edges found`
                )}
              </h2>
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>

            {/* Loading / Scanning State */}
            {(loading || scanning) && (
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

            {/* Edges List */}
            {!loading && !scanning && filteredEdges.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[#a1a1a6] text-lg">
                  No edges found matching your filters
                </p>
              </div>
            )}

            {!loading && !scanning && filteredEdges.length > 0 && (
              <div className="grid gap-4">
                {filteredEdges.map((edge) => (
                  <EdgeCard
                    key={edge.id}
                    edge={edge}
                    onClick={() => setSelectedEdge(edge)}
                  />
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
              {/* Category and Confidence */}
              <div className="flex items-center gap-4">
                <CategoryChip category={selectedEdge.category} />
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-sm font-medium">
                  {selectedEdge.confidence}
                </span>
              </div>

              {/* Event */}
              <div>
                <h3 className="text-lg font-semibold text-[#f4f4f5] mb-2">
                  {selectedEdge.event}
                </h3>
              </div>

              {/* Edge Size */}
              <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4">
                <p className="text-[#a1a1a6] text-sm mb-2">Edge Size</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {selectedEdge.aiProb > selectedEdge.marketProb ? '+' : '-'}
                  {Math.abs(selectedEdge.edge).toFixed(1)}%
                </p>
              </div>

              {/* Probabilities */}
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

              {/* Confidence Range */}
              <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4">
                <p className="text-[#a1a1a6] text-sm mb-3">Confidence Range</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a1a1a6]">Low</span>
                    <span className="text-[#f4f4f5] font-medium">
                      {selectedEdge.aiProbLow.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#27272a] rounded-full h-2">
                    <div
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{
                        width: `${((selectedEdge.aiProb - selectedEdge.aiProbLow) / (selectedEdge.aiProbHigh - selectedEdge.aiProbLow)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a1a1a6]">High</span>
                    <span className="text-[#f4f4f5] font-medium">
                      {selectedEdge.aiProbHigh.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Blurb */}
              <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4">
                <h4 className="text-[#f4f4f5] font-semibold mb-3">Analysis</h4>
                <p className="text-[#a1a1a6] text-sm leading-relaxed">
                  {selectedEdge.blurb}
                </p>
              </div>

              {/* Signals */}
              {selectedEdge.signals.length > 0 && (
                <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4">
                  <h4 className="text-[#f4f4f5] font-semibold mb-3">Signals</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEdge.signals.map((signal, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#27272a] text-[#a1a1a6] text-xs rounded-full"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Supporting Stats */}
              {selectedEdge.supportingStats && (
                <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4">
                  <h4 className="text-[#f4f4f5] font-semibold mb-3">
                    Supporting Stats
                  </h4>
                  <p className="text-[#a1a1a6] text-sm leading-relaxed">
                    {selectedEdge.supportingStats}
                  </p>
                </div>
              )}

              {/* Similar Setups */}
              {selectedEdge.similarSetups && (
                <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4">
                  <h4 className="text-[#f4f4f5] font-semibold mb-3">
                    Similar Setups
                  </h4>
                  <p className="text-[#a1a1a6] text-sm leading-relaxed">
                    {selectedEdge.similarSetups}
                  </p>
                </div>
              )}

              {/* Market Link */}
              <div>
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
        </div>
      )}
    </div>
  );
    }
