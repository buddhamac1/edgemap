'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MobileNav from '@/components/layout/MobileNav';

interface Settings {
  anthropicApiKey: string;
  notifyOnNewEdges: boolean;
  notifyOnEdgeResolution: boolean;
  notifyOnHighConfidence: boolean;
  minimumConfidence: number;
  minimumEdgeThreshold: number;
  darkMode: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  anthropicApiKey: '',
  notifyOnNewEdges: true,
  notifyOnEdgeResolution: true,
  notifyOnHighConfidence: true,
  minimumConfidence: 0,
  minimumEdgeThreshold: 5,
  darkMode: true,
};

export default function SettingsPage() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isMounted, setIsMounted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');

  // Load settings from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('edgemap-settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse settings:', error);
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('edgemap-settings', JSON.stringify(settings));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleInputChange = (field: keyof Settings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#09090b]">
      {/* Sidebar */}
      <Sidebar activePath={pathname} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden md:pb-0 pb-20">
        {/* Top Bar */}
        <TopBar
          title="Settings"
          searchQuery=""
          onSearchChange={() => {}}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-3xl">
            {/* API Configuration Section */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#f4f4f5] mb-4">
                API Configuration
              </h2>
              <div>
                <label className="block text-sm font-medium text-[#f4f4f5] mb-2">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  value={settings.anthropicApiKey}
                  onChange={(e) =>
                    handleInputChange('anthropicApiKey', e.target.value)
                  }
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                />
                <p className="text-xs text-[#a1a1a6] mt-2">
                  Your API key is stored locally in your browser only. Never shared with servers.
                </p>
              </div>
            </div>

            {/* Notification Preferences Section */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#f4f4f5] mb-4">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-[#f4f4f5]">
                      Notify on New Edges
                    </label>
                    <p className="text-xs text-[#a1a1a6] mt-1">
                      Get notified when new edges are detected
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifyOnNewEdges}
                    onChange={(e) =>
                      handleInputChange('notifyOnNewEdges', e.target.checked)
                    }
                    className="w-5 h-5 rounded border-[#27272a] bg-[#09090b] text-cyan-500 focus:ring-cyan-500"
                  />
                </div>

                <div className="border-t border-[#27272a]"></div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-[#f4f4f5]">
                      Notify on Edge Resolution
                    </label>
                    <p className="text-xs text-[#a1a1a6] mt-1">
                      Get notified when edges resolve
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifyOnEdgeResolution}
                    onChange={(e) =>
                      handleInputChange(
                        'notifyOnEdgeResolution',
                        e.target.checked
                      )
                    }
                    className="w-5 h-5 rounded border-[#27272a] bg-[#09090b] text-cyan-500 focus:ring-cyan-500"
                  />
                </div>

                <div className="border-t border-[#27272a]"></div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-[#f4f4f5]">
                      Notify on High Confidence
                    </label>
                    <p className="text-xs text-[#a1a1a6] mt-1">
                      Get notified for A+ and A confidence edges only
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifyOnHighConfidence}
                    onChange={(e) =>
                      handleInputChange(
                        'notifyOnHighConfidence',
                        e.target.checked
                      )
                    }
                    className="w-5 h-5 rounded border-[#27272a] bg-[#09090b] text-cyan-500 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Display Preferences Section */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#f4f4f5] mb-4">
                Display Preferences
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-[#f4f4f5]">
                      Minimum Confidence Filter
                    </label>
                    <span className="text-sm font-semibold text-cyan-400">
                      {settings.minimumConfidence}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={settings.minimumConfidence}
                    onChange={(e) =>
                      handleInputChange('minimumConfidence', Number(e.target.value))
                    }
                    className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <p className="text-xs text-[#a1a1a6] mt-2">
                    Only show edges with confidence at or above this level
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-[#f4f4f5]">
                      Minimum Edge Threshold
                    </label>
                    <span className="text-sm font-semibold text-cyan-400">
                      {settings.minimumEdgeThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={settings.minimumEdgeThreshold}
                    onChange={(e) =>
                      handleInputChange('minimumEdgeThreshold', Number(e.target.value))
                    }
                    className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <p className="text-xs text-[#a1a1a6] mt-2">
                    Only show edges with a minimum absolute difference from market price
                  </p>
                </div>

                <div className="border-t border-[#27272a] pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-[#f4f4f5]">
                        Dark Mode
                      </label>
                      <p className="text-xs text-[#a1a1a6] mt-1">
                        Always on
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.darkMode}
                      disabled
                      className="w-5 h-5 rounded border-[#27272a] bg-[#09090b] text-cyan-500 opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={saveSettings}
                disabled={saveStatus === 'saving'}
                className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                  saveStatus === 'saving'
                    ? 'bg-[#27272a] text-[#a1a1a6] cursor-not-allowed'
                    : saveStatus === 'saved'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : saveStatus === 'error'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
                }`}
              >
                {saveStatus === 'saving'
                  ? 'Saving...'
                  : saveStatus === 'saved'
                    ? 'Saved!'
                    : saveStatus === 'error'
                      ? 'Error saving'
                      : 'Save Settings'}
              </button>
              {saveStatus !== 'idle' && (
                <p
                  className={`text-sm ${
                    saveStatus === 'saved'
                      ? 'text-emerald-400'
                      : saveStatus === 'error'
                        ? 'text-red-400'
                        : 'text-[#a1a1a6]'
                  }`}
                >
                  {saveStatus === 'saved' && 'Settings saved to browser'}
                  {saveStatus === 'error' &&
                    'Failed to save settings (localStorage unavailable)'}
                  {saveStatus === 'saving' && 'Saving...'}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-[#09090b] border border-[#27272a] rounded-lg p-4">
              <p className="text-xs text-[#a1a1a6] leading-relaxed">
                <strong>Privacy Notice:</strong> All settings are stored locally in your browser using localStorage.
                No settings or data are sent to any server. Clearing your browser's local storage will reset these preferences.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav activePath={pathname} />
    </div>
  );
}
