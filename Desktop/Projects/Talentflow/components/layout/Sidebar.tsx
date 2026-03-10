'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Calendar,
  Brain
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Candidates', href: '/candidates', icon: Users },
  { name: 'Applications', href: '/applications', icon: FileText },
  { name: 'Interviews', href: '/interviews', icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-black text-white border-r border-[#262626]">
      {/* Logo */}
      <div className="relative flex items-center gap-3 px-6 py-6 border-b border-[#262626]">
        <div className="w-10 h-10 bg-[#FF7F00] rounded-lg flex items-center justify-center shadow-lg shadow-orange-900/50">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">TalentFlow</h1>
          <p className="text-xs text-gray-500">AI Recruitment</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative px-3 py-4 space-y-1">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden',
                isActive
                  ? 'bg-[#FF7F00] text-white shadow-lg shadow-orange-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              )}
            >
              <item.icon className={clsx('w-5 h-5 transition-transform duration-300', isActive && 'scale-110')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#262626]">
        <div className="text-xs text-gray-600 text-center hover:text-gray-500 transition-colors">
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
