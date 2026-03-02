import { ReactNode, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#FF7F00] hover:bg-[#e67300] text-white shadow-lg shadow-orange-900/30 hover:shadow-orange-900/50',
    secondary: 'bg-[#1a1a1a] hover:bg-[#262626] text-white border border-[#404040]',
    danger: 'bg-red-700 hover:bg-red-800 text-white',
    ghost: 'hover:bg-[#1a1a1a] text-gray-400 hover:text-white',
    outline: 'border border-[#262626] bg-transparent hover:bg-[#1a1a1a] text-gray-300 hover:text-white'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
