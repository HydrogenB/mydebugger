/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import React from 'react';
import { TextStats, CharacterCategory } from '../types';

interface StatsPanelProps {
  stats: TextStats;
}

/**
 * Category labels and colors for the breakdown display
 */
const CATEGORY_INFO: Record<CharacterCategory, { label: string; color: string }> = {
  emoji: { label: 'Emoji', color: 'bg-amber-400' },
  zwj: { label: 'ZWJ', color: 'bg-purple-400' },
  zwnj: { label: 'ZWNJ', color: 'bg-purple-300' },
  zwsp: { label: 'ZWSP', color: 'bg-pink-400' },
  vs: { label: 'Variation Selector', color: 'bg-blue-400' },
  skin_tone: { label: 'Skin Tone', color: 'bg-orange-400' },
  bom: { label: 'BOM', color: 'bg-red-400' },
  control: { label: 'Control', color: 'bg-red-500' },
  format: { label: 'Format', color: 'bg-violet-400' },
  private_use: { label: 'Private Use', color: 'bg-gray-400' },
  surrogate: { label: 'Surrogate', color: 'bg-red-600' },
  whitespace: { label: 'Whitespace', color: 'bg-cyan-400' },
  printable: { label: 'Printable', color: 'bg-green-400' },
};

/**
 * Panel component for displaying text statistics
 */
export const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  // Get non-zero categories for the breakdown
  const activeCategories = (Object.entries(stats.categoryBreakdown) as [CharacterCategory, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Visual Characters"
          value={stats.graphemeCount}
          sublabel="Graphemes"
          color="text-primary-600 dark:text-primary-400"
        />
        <StatCard
          label="Code Points"
          value={stats.codePointCount}
          sublabel="Unicode"
          color="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="UTF-8 Bytes"
          value={stats.utf8ByteCount}
          sublabel="Bytes"
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          label="JS String Length"
          value={stats.utf16Length}
          sublabel="UTF-16 Units"
          color="text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <span className="text-sm text-gray-700 dark:text-gray-300">Emoji Count</span>
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {stats.emojiCount}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
          <span className="text-sm text-gray-700 dark:text-gray-300">Hidden Characters</span>
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {stats.hiddenCharCount}
          </span>
        </div>
      </div>

      {/* Category Breakdown */}
      {activeCategories.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Code Point Breakdown
          </h4>
          <div className="flex flex-wrap gap-2">
            {activeCategories.map(([category, count]) => {
              const info = CATEGORY_INFO[category];
              return (
                <div
                  key={category}
                  className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm"
                >
                  <span className={`w-2 h-2 rounded-full ${info.color}`} />
                  <span className="text-gray-700 dark:text-gray-300">{info.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Individual stat card component
 */
interface StatCardProps {
  label: string;
  value: number;
  sublabel: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sublabel, color }) => (
  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-gray-400 dark:text-gray-500">{sublabel}</div>
  </div>
);

export default StatsPanel;
