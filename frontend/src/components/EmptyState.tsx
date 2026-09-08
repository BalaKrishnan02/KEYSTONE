import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="w-14 h-14 rounded-full bg-neutral-50 flex items-center justify-center mb-4 text-neutral-300">
        {icon || <Inbox size={28} />}
      </div>
      <h3 className="text-h3 text-neutral-600 mb-1">{title}</h3>
      {description && (
        <p className="text-body text-neutral-400 max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  );
}
