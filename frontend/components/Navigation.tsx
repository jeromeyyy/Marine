'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Waves,
  Fish,
  Dna,
  TreeDeciduous,
  LayoutDashboard,
  GitBranch,
  FileCode2,
  Menu,
  X,
  Compass,
  Map,
  TrendingUp,
  ChevronRight,
  Globe2,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Explorer', path: '/explorer', icon: Map },
  { name: 'Ocean', path: '/ocean', icon: Waves },
  { name: 'Fisheries', path: '/fisheries', icon: Fish },
  { name: 'eDNA Assays', path: '/edna', icon: Dna },
  { name: 'DNA Shape', path: '/edna-shape-analyzer', icon: Compass },
  { name: 'Taxonomy', path: '/taxonomy', icon: TreeDeciduous },
  { name: 'Species Map', path: '/species-locations', icon: Map },
  { name: 'Dynamic GIS', path: '/dynamic-map', icon: Globe2 },
  { name: 'Biodiversity', path: '/biodiversity', icon: TreeDeciduous },
  { name: 'Forecast', path: '/forecast', icon: TrendingUp },
  { name: 'Digital Twin', path: '/digital-twin', icon: Globe2 },
  { name: 'Correlations', path: '/correlations', icon: GitBranch },
  { name: 'API Docs', path: '/api-docs', icon: FileCode2 },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = pathname === '/';

  if (isHome) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-[#070c18]/85 backdrop-blur-xl shadow-2xl">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
                <Waves className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">RATNAKARA AI</p>
                <p className="text-sm font-semibold text-white">Marine Data Platform</p>
              </div>
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              {navItems.slice(0, 6).map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/dashboard"
                className="ml-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110"
              >
                Open Dashboard
              </Link>
            </div>

            <button
              className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-200 lg:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-cyan-400" /> : <Menu className="h-5 w-5 text-cyan-400" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-slate-800 bg-[#070c18] px-4 py-3 lg:hidden space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-cyan-400" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
      </header>
    );
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-800/80 bg-[#080d1a] lg:flex flex-col shadow-2xl backdrop-blur-xl">
        <div className="flex h-full w-full flex-col p-4">
          <Link href="/" className="mb-5 flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-3.5 shadow-lg backdrop-blur-md transition hover:border-cyan-500/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
              <Waves className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">RATNAKARA AI</p>
              <p className="text-sm font-semibold text-white">Marine Data Platform</p>
            </div>
          </Link>

          <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Scientific Modules</div>
          <nav className="space-y-1 overflow-y-auto pr-1 flex-1 custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/70 to-blue-950/50 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-semibold'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></div>}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Live Telemetry</span>
              </div>
              <span className="text-[10px] rounded bg-emerald-950/80 px-1.5 py-0.5 text-emerald-400 border border-emerald-500/30">ONLINE</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>AI Neural Engine:</span>
                <span className="text-cyan-400 font-mono">v2.4 Active</span>
              </div>
              <div className="flex justify-between">
                <span>Buoy Array:</span>
                <span className="text-slate-300 font-mono">6 Nodes Sync</span>
              </div>
              <div className="flex justify-between">
                <span>Response Time:</span>
                <span className="text-emerald-400 font-mono">14ms</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-800 bg-[#080d1a]/95 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 text-white">
              <Waves className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">RATNAKARA AI</span>
          </Link>
          <button
            className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-200"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-cyan-400" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="max-h-[75vh] overflow-y-auto border-t border-slate-800 bg-[#080d1a] p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <div className="h-14 lg:hidden" />
    </>
  );
}
