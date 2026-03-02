import { clsx } from 'clsx';
import { ReactNode } from 'react';

type StatusType = 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired' | 'open' | 'closed' | 'scheduled' | 'completed' | 'cancelled';
type VariantType = 'success' | 'outline' | 'default';

interface BadgeProps {
  status?: StatusType;
  variant?: VariantType;
  className?: string;
  children?: ReactNode;
}

export default function Badge({ status, variant, className, children }: BadgeProps) {
  const statusStyles = {
    applied: 'bg-[#FF7F00]/20 text-[#FF7F00] border border-[#FF7F00]/50',
    shortlisted: 'bg-orange-500/20 text-orange-400 border border-orange-500/50',
    interview: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
    rejected: 'bg-red-500/20 text-red-400 border border-red-500/50',
    hired: 'bg-green-500/20 text-green-400 border border-green-500/50',
    open: 'bg-green-500/20 text-green-400 border border-green-500/50',
    closed: 'bg-gray-600/20 text-gray-400 border border-gray-600/50',
    scheduled: 'bg-[#FF7F00]/20 text-[#FF7F00] border border-[#FF7F00]/50',
    completed: 'bg-green-500/20 text-green-400 border border-green-500/50',
    cancelled: 'bg-red-500/20 text-red-400 border border-red-500/50'
  };

  const variantStyles = {
    success: 'bg-green-500/20 text-green-400 border border-green-500/50',
    outline: 'border border-[#262626] text-gray-400',
    default: ''
  };

  return (
    <span className={clsx(
      'px-2.5 py-0.5 rounded-full text-xs font-medium transition-all hover:shadow-lg',
      status && statusStyles[status],
      variant && variantStyles[variant],
      className
    )}>
      {children || (status && status.charAt(0).toUpperCase() + status.slice(1))}
    </span>
  );
}
