import { CHANGELOG } from '../data/changelog';

export function Changelog() {
  return (
    <div className="max-w-2xl space-y-6">
      {CHANGELOG.map(entry => (
        <div key={entry.version} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-sm font-bold text-gray-900 dark:text-white">v{entry.version}</span>
            <span className="text-xs text-gray-400">{entry.date}</span>
          </div>
          <ul className="space-y-1">
            {entry.changes.map((change, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                {change}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
