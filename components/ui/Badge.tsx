import { clsx } from 'clsx';

type StatusType = 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired' | 'open' | 'closed' | 'scheduled' | 'completed' | 'cancelled';

interface BadgeProps {
  status: StatusType;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  const statusStyles = {
    applied: 'bg-blue-100 text-blue-800',
    shortlisted: 'bg-purple-100 text-purple-800',
    interview: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
    hired: 'bg-green-100 text-green-800',
    open: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <span className={clsx(
      'px-2.5 py-0.5 rounded-full text-xs font-medium',
      statusStyles[status],
      className
    )}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
