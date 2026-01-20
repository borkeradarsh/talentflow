import { ReactNode, CSSProperties } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
  style?: CSSProperties;
  [key: string]: any;
}

export default function Card({ children, className, title, action, style, ...props }: CardProps) {
  return (
    <div 
      style={style}
      className={clsx(
        'bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden group hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20',
        className
      )}
      {...props}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
      
      {(title || action) && (
        <div className="relative px-6 py-4 border-b border-slate-700/50 flex justify-between items-center">
          {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="relative p-6">
        {children}
      </div>

      <style jsx>{`
        div {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
