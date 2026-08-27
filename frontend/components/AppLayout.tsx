'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <>
      <Navigation />
      <main className={`min-h-screen bg-[#070c18] text-slate-100 ${isHome ? 'w-full' : 'lg:ml-72'}`}>
        {children}
      </main>
    </>
  );
}
