'use client';

import {  User, LogOut, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

export default function CandidateHeader() {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-64 z-30 bg-linear-to-r from-slate-800/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Welcome Message */}
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-200">
            Welcome back, <span className="text-blue-400">{user?.user_metadata?.name || 'Candidate'}</span>
          </h2>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700/40 rounded-lg transition-all duration-300 group"
            >
              <div className="w-8 h-8 bg-linear-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-slate-200">{user?.user_metadata?.name || 'User'}</p>
                <p className="text-xs text-slate-400">Candidate</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-lg shadow-2xl shadow-slate-900/50 py-2 z-50 animate-slideInUp">
                <div className="px-4 py-3 border-b border-slate-700">
                  <p className="text-sm font-medium text-slate-200">{user?.user_metadata?.name || 'User'}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" />
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-2 transition-colors duration-200"
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
