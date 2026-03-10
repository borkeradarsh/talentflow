'use client';

import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

export default function Header() {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-64 z-30 bg-black/90 backdrop-blur-xl border-b border-[#262626] h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#FF7F00] transition-colors" />
            <input
              type="text"
              placeholder="Search candidates, jobs..."
              className="w-full pl-10 text-white pr-4 py-2.5 bg-[#1a1a1a] border border-[#262626] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7F00] focus:border-transparent placeholder:text-gray-600 transition-all hover:bg-[#252525] hover:border-[#404040]"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-all duration-300 group">
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF7F00] rounded-full animate-pulse"></span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-[#1a1a1a] rounded-lg transition-all duration-300 group"
            >
              <div className="w-8 h-8 bg-[#FF7F00] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-orange-900/50">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-xs text-gray-500">Recruiter</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] backdrop-blur-xl border border-[#262626] rounded-lg shadow-2xl py-1 z-50 animate-slideInUp">
                <button
                  onClick={() => {
                    signOut();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-400 hover:text-white hover:bg-[#252525] flex items-center gap-2 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideInUp {
          animation: slideInUp 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}
