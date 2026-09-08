import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'flat';
    value: string;
    positive?: boolean; // whether the direction is good (green) or bad (red)
  };
  color?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

const iconBgMap: Record<string, string> = {
  accent:  'bg-accent-50 text-accent-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  danger:  'bg-danger-50 text-danger-600',
  neutral: 'bg-neutral-50 text-neutral-500',
};

export default function KPICard({
  label,
  value,
  icon,
  trend,
  color = 'accent',
  className = '',
}: KPICardProps) {
  const trendColor = trend
    ? trend.positive
      ? 'text-success-600'
      : 'text-danger-500'
    : 'text-neutral-400';

  const TrendIcon =
    trend?.direction === 'up'
      ? TrendingUp
      : trend?.direction === 'down'
      ? TrendingDown
      : Minus;

  return (
    <div className={`card flex flex-col gap-3 ${className}`}>
      <div className="flex items-start justify-between">
        <p className="text-caption text-neutral-400 font-medium uppercase tracking-wider">
          {label}
        </p>
        {icon && (
          <div className={`w-9 h-9 rounded-control flex items-center justify-center ${iconBgMap[color]}`}>
            {icon}
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-neutral-700 tracking-tight">{value}</p>

      {trend && (
        <div className={`flex items-center gap-1 text-caption font-medium ${trendColor}`}>
          <TrendIcon size={14} />
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
