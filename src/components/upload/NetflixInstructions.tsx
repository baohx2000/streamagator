import { ExternalLink, Info } from 'lucide-react';

export function NetflixInstructions() {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 text-sm">
      <div className="flex items-center gap-2 font-medium text-red-800 dark:text-red-300 mb-2">
        <Info className="w-4 h-4" />
        How to export your Netflix watch history
      </div>
      <ol className="list-decimal ml-5 space-y-1 text-red-700 dark:text-red-400">
        <li>
          Go to{' '}
          <a
            href="https://www.netflix.com/viewingactivity"
            target="_blank"
            rel="noopener noreferrer"
            className="underline inline-flex items-center gap-0.5"
          >
            netflix.com/viewingactivity <ExternalLink className="w-3 h-3" />
          </a>
        </li>
        <li>Scroll to the bottom of the page</li>
        <li>Click <strong>Download all</strong></li>
        <li>Upload the downloaded <strong>NetflixViewingHistory.csv</strong> here</li>
      </ol>
    </div>
  );
}
