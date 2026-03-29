import { ExternalLink, Info } from 'lucide-react';

export function HuluInstructions() {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 text-sm">
      <div className="flex items-center gap-2 font-medium text-green-800 dark:text-green-300 mb-2">
        <Info className="w-4 h-4" />
        How to export your Hulu watch history
      </div>
      <ol className="list-decimal ml-5 space-y-1 text-green-700 dark:text-green-400">
        <li>
          Go to{' '}
          <a
            href="https://www.hulu.com/account/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline inline-flex items-center gap-0.5"
          >
            hulu.com/account/privacy <ExternalLink className="w-3 h-3" />
          </a>
        </li>
        <li>Click <strong>Download My Information</strong></li>
        <li>Select <strong>Watch History</strong> and request the export</li>
        <li>You'll receive an email with a download link (can take up to 30 days)</li>
        <li>Download the ZIP — or if Hulu sent a <strong>PDF</strong>, upload that directly here</li>
      </ol>
      <p className="mt-2 text-green-600 dark:text-green-500 text-xs">
        Both PDF and CSV formats from Hulu are supported.
      </p>
    </div>
  );
}
