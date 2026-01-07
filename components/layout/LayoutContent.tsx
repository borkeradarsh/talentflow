'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 min-h-screen bg-white">
        <div className="p-6">
          {children}
        </div>
      </main>
    </ProtectedRoute>
  );
}
