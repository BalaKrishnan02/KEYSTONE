import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { WorkOrderStatusHistory } from '../types';
import { statusLabel } from './StatusBadge';

interface TimelineProps {
  items: WorkOrderStatusHistory[];
  className?: string;
}

export default function Timeline({ items, className = '' }: TimelineProps) {
  if (!items.length) return null;

  return (
    <div className={`relative ${className}`}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <div key={item.id} className="flex gap-3 group">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-accent-200 bg-white z-10 group-first:border-accent-500">
                {idx === 0 ? (
                  <ArrowRight size={12} className="text-accent-500" />
                ) : isLast ? (
                  <CheckCircle2 size={14} className="text-success-500" />
                ) : (
                  <Circle size={8} className="text-accent-400" fill="currentColor" />
                )}
              </div>
              {!isLast && (
                <div className="w-0.5 h-full bg-neutral-200 min-h-[24px]" />
              )}
            </div>

            {/* Content */}
            <div className="pb-5 -mt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                {item.fromStatus && (
                  <span className="text-caption text-neutral-400">
                    {statusLabel(item.fromStatus)}
                  </span>
                )}
                {item.fromStatus && (
                  <ArrowRight size={10} className="text-neutral-300" />
                )}
                <span className="text-label text-neutral-700">
                  {statusLabel(item.toStatus)}
                </span>
              </div>
              <p className="text-caption text-neutral-400 mt-0.5">
                {item.changedByName} · {format(new Date(item.changedAt), 'MMM d, yyyy h:mm a')}
              </p>
              {item.note && (
                <p className="text-caption text-neutral-500 mt-1 bg-neutral-50 rounded px-2 py-1 border-l-2 border-accent-200">
                  {item.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
