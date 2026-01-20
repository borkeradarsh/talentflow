import { clsx } from 'clsx';

type StatusType = 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired' | 'open' | 'closed' | 'scheduled' | 'completed' | 'cancelled';

interface BadgeProps {
  status: StatusType;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  const statusStyles = {
    applied: 'bg-blue-500/30 text-blue-300 border border-blue-500/50',
    shortlisted: 'bg-purple-500/30 text-purple-300 border border-purple-500/50',
    interview: 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50',
    rejected: 'bg-red-500/30 text-red-300 border border-red-500/50',
    hired: 'bg-green-500/30 text-green-300 border border-green-500/50',
    open: 'bg-green-500/30 text-green-300 border border-green-500/50',
    closed: 'bg-slate-600/30 text-slate-300 border border-slate-600/50',
    scheduled: 'bg-blue-500/30 text-blue-300 border border-blue-500/50',
    completed: 'bg-green-500/30 text-green-300 border border-green-500/50',
    cancelled: 'bg-red-500/30 text-red-300 border border-red-500/50'
  };

  return (
    <span className={clsx(
      'px-2.5 py-0.5 rounded-full text-xs font-medium transition-all hover:shadow-lg',
      statusStyles[status],
      className
    )}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
