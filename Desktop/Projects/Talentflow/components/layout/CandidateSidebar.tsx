'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  User,
  Briefcase,
  FileText,
  Calendar,
  Settings,
  Brain
} from 'lucide-react';

const navigation = [
  { name: 'Profile', href: '/candidate/profile', icon: User },
  { name: 'Browse Jobs', href: '/candidate/jobs', icon: Briefcase },
  { name: 'My Applications', href: '/candidate/applications', icon: FileText },
  { name: 'Interviews', href: '/candidate/interviews', icon: Calendar },
  { name: 'Settings', href: '/candidate/settings', icon: Settings },
];

export default function CandidateSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-white border-r border-slate-700/50 backdrop-blur-sm">
      {/* Background accent */}
      <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-6 py-6 border-b border-slate-700/50">
        <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center shadow-lg">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-linear-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">TalentFlow</h1>
          <p className="text-xs text-slate-400">Candidate Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/candidate/profile' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden',
                isActive
                  ? 'bg-linear-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
              )}
            >
              <item.icon className={clsx('w-5 h-5 transition-transform duration-300', isActive && 'group-hover:scale-110')} />
              {item.name}
              {isActive && (
                <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10 -z-10"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 backdrop-blur">
        <div className="text-xs text-slate-500 text-center hover:text-slate-400 transition-colors">
          © 2026 TalentFlow AI
        </div>
      </div>

      <style jsx>{`
        aside {
          animation: slideInLeft 0.5s ease-out;
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </aside>
  );
}
