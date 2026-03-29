import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Spinner } from '../ui/Spinner';
import type { ServiceUploadState, StreamingService } from '../../types';
import { SERVICE_LABELS, SERVICE_TEXT_CLASSES } from '../../constants/services';

interface ServiceCardProps {
  service: StreamingService;
  state: ServiceUploadState;
  instructions?: React.ReactNode;
}

export function ServiceCard({ service, state, instructions }: ServiceCardProps) {
  const label = SERVICE_LABELS[service];
  const textClass = SERVICE_TEXT_CLASSES[service];

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className={`font-semibold ${textClass}`}>{label}</span>
        {state.status === 'idle' && <span className="text-xs text-gray-400">No file loaded</span>}
        {state.status === 'parsing' && <Spinner size={16} />}
        {state.status === 'done' && (
          <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
            <CheckCircle className="w-4 h-4" />
            {state.count.toLocaleString()} entries
          </span>
        )}
        {state.status === 'error' && (
          <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
            <XCircle className="w-4 h-4" />
            Error
          </span>
        )}
      </div>

      {state.fileName && state.status === 'done' && (
        <p className="text-xs text-gray-500 truncate">{state.fileName}</p>
      )}

      {state.error && (
        <p className="text-xs text-red-500">{state.error}</p>
      )}

      {state.warnings.length > 0 && (
        <details className="text-xs text-amber-600 dark:text-amber-400">
          <summary className="flex items-center gap-1 cursor-pointer">
            <AlertCircle className="w-3 h-3" />
            {state.warnings.length} warning{state.warnings.length > 1 ? 's' : ''}
          </summary>
          <ul className="mt-1 ml-3 list-disc space-y-0.5">
            {state.warnings.slice(0, 5).map((w, i) => (
              <li key={i}>{w}</li>
            ))}
            {state.warnings.length > 5 && <li>...and {state.warnings.length - 5} more</li>}
          </ul>
        </details>
      )}

      {instructions && state.status === 'idle' && (
        <div className="mt-2">{instructions}</div>
      )}
    </div>
  );
}
