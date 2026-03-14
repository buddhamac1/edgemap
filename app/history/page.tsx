'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MobileNav from '@/components/layout/MobileNav';
import { Edge, AggregateStats } from '@/lib/types';
import { getMockEdges } from '@/data/mock-edges';

export default function HistoryPage() {
  const pathname = usePathname();
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<AggregateStats | null>(null);

  // Fetch resolved edges
  useEffect(() => {
    const fetchEdges = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/edges');
        if (response.ok) {
          const data = await response.json();
          // Filter to resolved edges only
          const resolvedEdges = data.filter((e: Edge) => e.status === 'resolved');
          setEdges(resolvedEdges);
        } else {
          // Fallback to mock data
          const mockEdges = getMockEdges();
          const resolvedEdges = mockEdges.filter((e) => e.status === 'resolved');
          setEdges(resolvedEdges);
        }
      } catch (error) {
        console.error('Failed to fetch edges:', error);
        // Fallback to mock data
        const mockEdges = getMockEdges();
        const resolvedEdges = mockEdges.filter((e) => e.status === 'resolved');
        setEdges(resolvedEdges);
      } finally {
        setLoading(false);
      }
    };

    fetchEdges();
  }, []);

  // Calculate stats
  useEffect(() => {
    if (edges.length > 0) {
      const hits = edges.filter((e) => e.outcome === 'hit').length;
      const misses = edges.filter((e) => e.outcome === 'miss').length;

      setStats({
        totalSignals: edges.length,
        activeSignals: 0,
        hits,
        misses,
        hitRate: edges.length > 0 ? (hits / (hits + misses)) * 100 : 0,
        avgEdge:
          edges.reduce((sum, e) => sum + e.edge, 0) / edges.length || 0,
        bestEdge: Math.max(...edges.map((e) => e.edge), 0),
      });
    }
  }, [edges]);

  // Filter edges
  const filteredEdges = edges.filter((edge) => {
    if (
      searchQuery &&
      !edge.event.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !edge.blurb.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-[#09090b]">
      {/* Sidebar */}
      <Sidebar activePath={pathname} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden md:pb-0 pb-20">
        {/* Top Bar */}
        <TopBar
          title="History"
          edgeCount={filteredEdges.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl">
            {/* Summary Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                  <p className="text-[#a1a1a6] text-sm font-medium mb-1">
                    Resolved
                  </p>
                  <p className="text-2xl font-bold text-[#f4f4f5]">
                    {stats.totalSignals}
                  </p>
                </div>
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                  <p className="text-[#a1a1a6] text-sm font-medium mb-1">
                    Hits
                  </p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {stats.hits}
                  </p>
                </div>
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                  <p className="text-[#a1a1a6] text-sm font-medium mb-1">
                    Misses
                  </p>
                  <p className="text-2xl font-bold text-red-400">
                    {stats.misses}
                  </p>
                </div>
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                  <p className="text-[#a1a1a6] text-sm font-medium mb-1">
                    Hit Rate
                  </p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {stats.hitRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                  <p className="text-[#a1a1a6] text-sm font-medium mb-1">
                    Best Edge
                  </p>
                  <p className="text-2xl font-bold text-orange-400">
                    {stats.bestEdge.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            {/* Performance Table */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <p className="text-[#a1a1a6]">Loading history...</p>
                </div>
              ) : filteredEdges.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[#a1a1a6]">
                    No resolved edges found
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#27272a] bg-[#09090b]">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider">
                          Edge
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider">
                          Outcome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider">
                          Resolved
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a]">
                      {filteredEdges.map((edge) => (
                        <tr
                          key={edge.id}
                          className="hover:bg-[#27272a]/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-[#f4f4f5] line-clamp-1">
                              {edge.event}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-[#27272a] text-[#a1a1a6]">
                              {edge.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-cyan-400">
                              {edge.aiProb > edge.marketProb ? '+' : '-'}
                              {Math.abs(edge.edge).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                edge.outcome === 'hit'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : edge.outcome === 'miss'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-[#27272a] text-[#a1a1a6]'
                              }`}
                            >
                              {edge.outcome === 'hit'
                                ? '✓ Hit'
                                : edge.outcome === 'miss'
                                  ? '✗ Miss'
                                  : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-[#a1a1a6]">
                              {edge.resolvedAt
                                ? new Date(
                                    edge.resolvedAt
                                  ).toLocaleDateString()
                                : '-'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav activePath={pathname} />
    </div>
  );
}
