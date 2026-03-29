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
import { PlexInstructions } from './components/upload/PlexInstructions';
import { FilterBar } from './components/history/FilterBar';
import { HistoryTable } from './components/history/HistoryTable';
import { StatsDashboard } from './components/stats/StatsDashboard';
import { MostWatched } from './components/stats/MostWatched';
import { Changelog } from './components/Changelog';
import { Button } from './components/ui/Button';
import { EmptyState } from './components/ui/EmptyState';
import { BarChart2, List, TrendingUp, Clock } from 'lucide-react';

type Phase = 'upload' | 'explore';
type Tab = 'stats' | 'history' | 'mostwatched' | 'updates';

function UploadPhase({
  uploadStates,
  handleFiles,
  onViewHistory,
  savedCount,
}: {
  uploadStates: ReturnType<typeof useFileUpload>['uploadStates'];
  handleFiles: (files: FileList | File[]) => void;
  onViewHistory: () => void;
  savedCount: number;
}) {
  return (
    <div className="w-full px-6 py-10 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload your watch history</h2>
        <p className="mt-2 text-gray-500">
          Export CSV/PDF files from Netflix, Prime Video, Hulu, and Plex, then drop them below.
          Everything is processed locally — your data never leaves your device.
        </p>
      </div>

      {savedCount > 0 && (
        <div className="flex flex-col items-center gap-2">
          <Button onClick={onViewHistory} className="px-8">
            View History ({savedCount.toLocaleString()} entries) →
          </Button>
          <p className="text-xs text-gray-400">or upload more files below</p>
        </div>
      )}

      <UploadZone onFiles={handleFiles} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <ServiceCard service="netflix" state={uploadStates.netflix} instructions={<NetflixInstructions />} />
        <ServiceCard service="amazon" state={uploadStates.amazon} instructions={<AmazonInstructions />} />
        <ServiceCard service="hulu" state={uploadStates.hulu} instructions={<HuluInstructions />} />
        <ServiceCard service="plex" state={uploadStates.plex} instructions={<PlexInstructions />} />
      </div>

      {uploadStates.unknown.status !== 'idle' && (
        <ServiceCard service="unknown" state={uploadStates.unknown} />
      )}
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState<Phase>(() =>
    typeof window !== 'undefined' && localStorage.getItem('streamagator_entries') ? 'explore' : 'upload'
  );
  const [tab, setTab] = useState<Tab>('stats');
  const [uniqueOnly, setUniqueOnly] = useState(false);

  const { entries, filteredEntries, availableYears, filters, stats, serviceEntryCounts, addEntries, clearAll, setFilters, resetFilters } =
    useWatchHistory();

  const { uploadStates, handleFiles } = useFileUpload(addEntries);

  function handleReset() {
    setPhase('upload');
  }

  function handleClearAll() {
    clearAll();
    setPhase('upload');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header entries={filteredEntries} onReset={handleReset} onClearAll={handleClearAll} />

      <main className="flex-1">
        {phase === 'upload' ? (
          <UploadPhase
            uploadStates={uploadStates}
            handleFiles={handleFiles}
            onViewHistory={() => setPhase('explore')}
            savedCount={entries.length}
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
              <button
                onClick={() => setTab('updates')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === 'updates'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                Updates
              </button>
            </div>

            {/* Filters hidden on Updates tab */}
            {tab !== 'updates' && (
              <FilterBar
                filters={filters}
                setFilters={setFilters}
                resetFilters={resetFilters}
                counts={serviceEntryCounts}
                availableYears={availableYears}
                uniqueOnly={uniqueOnly}
                setUniqueOnly={setUniqueOnly}
              />
            )}

            {tab === 'updates' ? (
              <Changelog />
            ) : filteredEntries.length === 0 ? (
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
