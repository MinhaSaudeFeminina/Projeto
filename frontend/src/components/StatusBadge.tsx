import { cn } from '@/lib/utils';
import { statusLabels, statusColors, priorityLabels, priorityColors } from '@/data/mockData';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'priority';
  className?: string;
}

export function StatusBadge({ status, type = 'status', className }: StatusBadgeProps) {
  const labels = type === 'priority' ? priorityLabels : statusLabels;
  const colors = type === 'priority' ? priorityColors : statusColors;

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      colors[status] || 'bg-muted text-muted-foreground',
      className
    )}>
      {labels[status] || status}
    </span>
  );
}
