import { useState } from 'react';
import { useWatchHistory } from './hooks/useWatchHistory';
import { useFileUpload } from './hooks/useFileUpload';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { UploadZone } from './components/upload/UploadZone';
import { ServiceCard } from './components/upload/ServiceCard';
import { NetflixInstructions } from './components/upload/NetflixInstructions';
import { AmazonInstructions } from './components/upload/AmazonInstructions';
import { HuluInstructions } from './components/upload/HuluInstructions';
import { FilterBar } from './components/history/FilterBar';
import { HistoryTable } from './components/history/HistoryTable';
import { StatsDashboard } from './components/stats/StatsDashboard';
import { MostWatched } from './components/stats/MostWatched';
import { Button } from './components/ui/Button';
import { EmptyState } from './components/ui/EmptyState';
import { BarChart2, List, TrendingUp } from 'lucide-react';

type Phase = 'upload' | 'explore';
type Tab = 'stats' | 'history' | 'mostwatched';

function UploadPhase({
  uploadStates,
  handleFiles,
  onViewHistory,
  hasEntries,
}: {
  uploadStates: ReturnType<typeof useFileUpload>['uploadStates'];
  handleFiles: (files: FileList | File[]) => void;
  onViewHistory: () => void;
  hasEntries: boolean;
}) {
  return (
    <div className="w-full px-6 py-10 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload your watch history</h2>
        <p className="mt-2 text-gray-500">
          Export CSV files from Netflix, Prime Video, and Hulu, then drop them below.
          Everything is processed locally — your data never leaves your device.
        </p>
      </div>

      <UploadZone onFiles={handleFiles} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ServiceCard service="netflix" state={uploadStates.netflix} instructions={<NetflixInstructions />} />
        <ServiceCard service="amazon" state={uploadStates.amazon} instructions={<AmazonInstructions />} />
        <ServiceCard service="hulu" state={uploadStates.hulu} instructions={<HuluInstructions />} />
      </div>

      {uploadStates.unknown.status !== 'idle' && (
        <ServiceCard service="unknown" state={uploadStates.unknown} />
      )}


{hasEntries && (
        <div className="flex justify-center">
          <Button onClick={onViewHistory} className="px-8">
            View History →
          </Button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('upload');
  const [tab, setTab] = useState<Tab>('stats');
  const [uniqueOnly, setUniqueOnly] = useState(false);

  const { entries, filteredEntries, filters, stats, serviceEntryCounts, addEntries, setFilters, resetFilters } =
    useWatchHistory();

  const { uploadStates, handleFiles } = useFileUpload(addEntries);

  function handleReset() {
    setPhase('upload');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header entries={filteredEntries} onReset={handleReset} />

      <main className="flex-1">
        {phase === 'upload' ? (
          <UploadPhase
            uploadStates={uploadStates}
            handleFiles={handleFiles}
            onViewHistory={() => setPhase('explore')}
            hasEntries={entries.length > 0}
          />
        ) : (
          <div className="w-full px-6 py-6 space-y-4">
            {/* Tab bar */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 w-fit">
              <button
                onClick={() => setTab('stats')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === 'stats'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                Statistics
              </button>
              <button
                onClick={() => setTab('history')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === 'history'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
                History ({filteredEntries.length.toLocaleString()})
              </button>
              <button
                onClick={() => setTab('mostwatched')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === 'mostwatched'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Most Watched
              </button>
            </div>

            {/* Filters always visible in explore phase */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              resetFilters={resetFilters}
              counts={serviceEntryCounts}
              uniqueOnly={uniqueOnly}
              setUniqueOnly={setUniqueOnly}
            />

            {filteredEntries.length === 0 ? (
              <EmptyState
                title="No entries match your filters"
                description="Try adjusting or resetting your filters."
              />
            ) : tab === 'stats' ? (
              <StatsDashboard stats={stats} entries={filteredEntries} />
            ) : tab === 'mostwatched' ? (
              <MostWatched entries={filteredEntries} />
            ) : (
              <HistoryTable entries={filteredEntries} uniqueOnly={uniqueOnly} />
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
