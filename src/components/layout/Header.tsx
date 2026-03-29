import { Tv } from 'lucide-react';
import { Button } from '../ui/Button';
import { exportToCSV } from '../../utils/export';
import type { NormalizedEntry } from '../../types';

interface HeaderProps {
  entries: NormalizedEntry[];
  onReset: () => void;
  onClearAll: () => void;
}

export function Header({ entries, onReset, onClearAll }: HeaderProps) {
  return (
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
      </div>
    </header>
  );
}
