interface ProgressBarProps {
  value: number; // 0-100
  color?: 'success' | 'accent' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const colorMap: Record<string, string> = {
  success: 'bg-success-500',
  accent:  'bg-accent-500',
  warning: 'bg-warning-500',
  danger:  'bg-danger-500',
};

export default function ProgressBar({
  value,
  color = 'accent',
  size = 'sm',
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const heightClass = size === 'md' ? 'h-2' : 'h-1.5';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 ${heightClass} bg-neutral-100 rounded-full overflow-hidden`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-500 ease-out ${colorMap[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-caption text-neutral-500 font-medium min-w-[36px] text-right">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
