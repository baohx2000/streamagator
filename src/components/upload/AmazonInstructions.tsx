import { ExternalLink, Info } from 'lucide-react';

export function AmazonInstructions() {
  return (
    <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700 rounded-lg p-4 text-sm">
      <div className="flex items-center gap-2 font-medium text-sky-800 dark:text-sky-300 mb-2">
        <Info className="w-4 h-4" />
        How to export your Prime Video watch history
      </div>
      <ol className="list-decimal ml-5 space-y-1 text-sky-700 dark:text-sky-400">
        <li>
          Go to{' '}
          <a
            href="https://www.amazon.com/hz/privacy-central/data-requests/preview.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline inline-flex items-center gap-0.5"
          >
            amazon.com/hz/privacy-central/data-requests <ExternalLink className="w-3 h-3" />
          </a>
        </li>
        <li>Click <strong>Request My Data</strong></li>
        <li>Select <strong>Prime Video Watch History</strong> and submit</li>
        <li>You'll receive an email when the export is ready (can take a few days)</li>
        <li>Download the ZIP, find the Prime Video CSV, and upload it here</li>
      </ol>
    </div>
  );
}
