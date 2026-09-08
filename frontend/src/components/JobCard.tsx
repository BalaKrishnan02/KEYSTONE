import { ReactNode } from 'react';
import { MapPin, User, Clock } from 'lucide-react';
import StatusBadge, { priorityVariant, statusVariant, slaVariant, statusLabel, slaLabel } from './StatusBadge';

interface JobCardProps {
  title: string;
  code: string;
  priority: string;
  status: string;
  customerName?: string;
  siteName?: string;
  technicianName?: string;
  slaState?: string;
  slaDueDate?: string;
  totalMinutes?: number;
  onClick?: () => void;
  actions?: ReactNode;
  className?: string;
  draggable?: boolean;
}

const priorityBorderColor: Record<string, string> = {
  CRITICAL: 'border-l-danger-500',
  HIGH:     'border-l-warning-500',
  MEDIUM:   'border-l-accent-500',
  LOW:      'border-l-success-500',
};

export default function JobCard({
  title,
  code,
  priority,
  status,
  customerName,
  siteName,
  technicianName,
  slaState,
  slaDueDate,
  totalMinutes,
  onClick,
  actions,
  className = '',
  draggable = false,
}: JobCardProps) {
  const borderColor = priorityBorderColor[priority] || 'border-l-neutral-300';

  return (
    <div
      className={`card border-l-[3px] ${borderColor} cursor-pointer hover:shadow-card transition-all duration-150 ${className}`}
      onClick={onClick}
      role={draggable ? undefined : 'button'}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Header: code + badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-caption text-neutral-400 font-medium">{code}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusBadge variant={priorityVariant(priority)}>{priority}</StatusBadge>
          <StatusBadge variant={statusVariant(status)}>{statusLabel(status)}</StatusBadge>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-h4 text-neutral-700 line-clamp-2 mb-2">{title}</h4>

      {/* Meta row */}
      <div className="space-y-1.5 text-caption text-neutral-400">
        {siteName && (
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="truncate">{siteName}</span>
          </div>
        )}
        {technicianName && (
          <div className="flex items-center gap-1.5">
            <User size={12} className="flex-shrink-0" />
            <span className="truncate">{technicianName}</span>
          </div>
        )}
        {totalMinutes != null && totalMinutes > 0 && (
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="flex-shrink-0" />
            <span>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m logged</span>
          </div>
        )}
      </div>

      {/* SLA & actions footer */}
      {(slaState || actions) && (
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-100">
          {slaState && (
            <StatusBadge variant={slaVariant(slaState)} dot shape="pill">
              {slaLabel(slaState)}
            </StatusBadge>
          )}
          {actions && (
            <div className="flex items-center gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
              {actions}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
