import { ReactNode } from 'react';

type Variant = 'success' | 'accent' | 'warning' | 'danger' | 'neutral';
type Shape = 'rect' | 'pill';

interface StatusBadgeProps {
  children: ReactNode;
  variant?: Variant;
  shape?: Shape;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  success: 'bg-success-50 text-success-600',
  accent:  'bg-accent-50 text-accent-600',
  warning: 'bg-warning-50 text-warning-600',
  danger:  'bg-danger-50 text-danger-600',
  neutral: 'bg-neutral-50 text-neutral-500',
};

const dotClasses: Record<Variant, string> = {
  success: 'bg-success-500',
  accent:  'bg-accent-500',
  warning: 'bg-warning-500',
  danger:  'bg-danger-500',
  neutral: 'bg-neutral-300',
};

export default function StatusBadge({
  children,
  variant = 'neutral',
  shape = 'rect',
  dot = false,
  className = '',
}: StatusBadgeProps) {
  const shapeClass = shape === 'pill' ? 'rounded-pill px-2.5' : 'rounded px-2';

  return (
    <span
      className={`inline-flex items-center gap-1.5 py-0.5 text-badge font-semibold leading-none whitespace-nowrap ${shapeClass} ${variantClasses[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant]}`} />}
      {children}
    </span>
  );
}

/* ── Helpers for common mappings ── */

export function statusVariant(status: string): Variant {
  switch (status) {
    case 'NEW':         return 'accent';
    case 'ASSIGNED':    return 'accent';
    case 'IN_PROGRESS': return 'warning';
    case 'ON_HOLD':     return 'neutral';
    case 'COMPLETED':   return 'success';
    case 'CLOSED':      return 'success';
    case 'CANCELLED':   return 'danger';
    default:            return 'neutral';
  }
}

export function priorityVariant(priority: string): Variant {
  switch (priority) {
    case 'CRITICAL': return 'danger';
    case 'HIGH':     return 'warning';
    case 'MEDIUM':   return 'accent';
    case 'LOW':      return 'success';
    default:         return 'neutral';
  }
}

export function slaVariant(slaState?: string): Variant {
  switch (slaState) {
    case 'ON_TRACK': return 'success';
    case 'AT_RISK':  return 'warning';
    case 'BREACHED': return 'danger';
    default:         return 'neutral';
  }
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

export function slaLabel(sla?: string): string {
  switch (sla) {
    case 'ON_TRACK': return 'On Track';
    case 'AT_RISK':  return 'At Risk';
    case 'BREACHED': return 'Breached';
    default:         return 'N/A';
  }
}
