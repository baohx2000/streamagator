import { twMerge } from 'tailwind-merge';
import { SERVICE_BG_CLASSES, SERVICE_LABELS } from '../../constants/services';
import type { StreamingService } from '../../types';

interface BadgeProps {
  service: StreamingService;
  className?: string;
}

export function ServiceBadge({ service, className }: BadgeProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white',
        SERVICE_BG_CLASSES[service],
        className
      )}
    >
      {SERVICE_LABELS[service]}
    </span>
  );
}

interface ContentBadgeProps {
  type: string;
  className?: string;
}

export function ContentBadge({ type, className }: ContentBadgeProps) {
  const color = type === 'movie' ? 'bg-purple-500' : type === 'episode' ? 'bg-blue-500' : 'bg-gray-400';
  return (
    <span className={twMerge('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white', color, className)}>
      {type}
    </span>
  );
}
