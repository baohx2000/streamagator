import { useState } from 'react';
import { Tv, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Changelog } from '../Changelog';
import { exportToCSV } from '../../utils/export';
import type { NormalizedEntry } from '../../types';

interface HeaderProps {
  entries: NormalizedEntry[];
  onReset: () => void;
  onClearAll: () => void;
}

export function Header({ entries, onReset, onClearAll }: HeaderProps) {
  const [showUpdates, setShowUpdates] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">Streamagator</h1>
            <p className="text-xs text-gray-500">Watch history aggregator</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <Button variant="secondary" onClick={() => exportToCSV(entries)}>
              Export CSV
            </Button>
          )}
          <Button variant="ghost" onClick={onReset}>
            Upload Files
          </Button>
          {entries.length > 0 && (
            <Button variant="ghost" onClick={() => {
              if (window.confirm('Clear all watch history? This cannot be undone.')) onClearAll();
            }}>
              Clear Data
            </Button>
          )}
          <Button variant="ghost" onClick={() => setShowUpdates(true)}>
            Updates
          </Button>
        </div>
      </header>

      {showUpdates && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-6 overflow-y-auto">
          <div className="w-full max-w-lg bg-gray-50 dark:bg-gray-950 rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Updates</h2>
              <button onClick={() => setShowUpdates(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <Changelog />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
