import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/AppLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Ratnakara Marine AI Platform',
  description: 'AI-Driven Multimodal Oceanographic, Fisheries & eDNA Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#070c18] text-slate-100 antialiased`}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
