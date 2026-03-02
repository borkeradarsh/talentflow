'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';
  // Only candidate portal pages (not recruiter's candidates page) should have no sidebar
  const isCandidatePortal = pathname.startsWith('/candidate/') || pathname === '/candidate';

  if (isAuthPage || isLandingPage) {
    return <>{children}</>;
  }

  // Candidate portal pages handle their own layout
  if (isCandidatePortal) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 min-h-screen bg-[#0a0a0a]">
        {/* Subtle background pattern */}
        <div className="fixed inset-0 ml-64 overflow-hidden pointer-events-none z-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #FF7F00 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="p-6 relative z-10">
          {children}
        </div>
      </main>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 127, 0, 0.3); }
          50% { box-shadow: 0 0 30px rgba(255, 127, 0, 0.5); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
          opacity: 1;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out;
          opacity: 1;
        }

        .animate-slideInUp {
          animation: slideInUp 0.5s ease-out;
          opacity: 1;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </ProtectedRoute>
  );
}
