'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface SidebarProps {
  activePath: string;
  onScanNow?: () => void;
  lastScan?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  activePath,
  onScanNow,
  lastScan,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4V8m0 16h.01"
          />
        </svg>
      ),
    },
    {
      name: 'History',
      path: '/history',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      name: 'Watchlist',
      path: '/watchlist',
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <aside
      className="hidden md:flex flex-col w-64 bg-edge-bg border-r border-edge-border h-screen sticky top-0"
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="p-6 border-b border-edge-border">
        <div className="flex items-center gap-2">
          {/* EdgeMap Logo */}
          <svg
            className="w-7 h-7"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
          </svg>
          <span className="text-lg font-bold text-edge-text">
            Edge<span className="text-edge-accent">Map</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6" aria-label="Navigation menu">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-edge-card text-edge-accent'
                      : 'text-edge-muted hover:text-edge-text hover:bg-edge-card/50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-edge-border p-4">
        {/* Last Scan Info */}
        <div className="mb-4 px-2 py-3 bg-edge-card/50 rounded-lg">
          <p className="text-xs text-edge-dim mb-1">Last scan</p>
          <p className="text-sm font-semibold text-edge-text">
            {lastScan || 'Never'}
          </p>
        </div>

        {/* Scan Now Button */}
        <button
          onClick={onScanNow}
          className="w-full px-4 py-2 bg-edge-accent text-edge-bg font-semibold rounded-lg hover:bg-edge-accent-hover transition-colors text-sm"
          aria-label="Perform manual scan now"
        >
          Scan Now
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
