'use client';

import Link from 'next/link';
import {
  Waves,
  Fish,
  Dna,
  TreeDeciduous,
  TrendingUp,
  Globe2,
  ArrowRight,
  ShieldCheck,
  Radar,
  Sparkles,
  Cpu,
  Layers,
  Compass,
  Activity,
  CheckCircle2,
  Database
} from 'lucide-react';

const coreModules = [
  {
    title: 'Physical Oceanography',
    href: '/ocean',
    icon: Waves,
    tag: 'Sensors & SST',
    description: 'Real-time telemetry stream tracking sea surface temperature anomalies, wave dynamics, and wind vectors across coastal buoy arrays.',
    gradient: 'from-cyan-500/20 to-blue-500/10',
    border: 'border-cyan-500/30',
    accent: 'text-cyan-400',
  },
  {
    title: 'Fisheries & Biomass',
    href: '/fisheries',
    icon: Fish,
    tag: 'Catch & Abundance',
    description: 'Species-level biomass trends, CPUE modeling, commercial landings analytics, and stock vulnerability indices across Indian maritime sectors.',
    gradient: 'from-blue-500/20 to-indigo-500/10',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
  },
  {
    title: 'Genomic eDNA Assays',
    href: '/edna',
    icon: Dna,
    tag: 'Metabarcoding',
    description: 'Environmental DNA assay records (16S, COX1, ITS) with structural shape analysis and a Darwin Core-oriented export structure.',
    gradient: 'from-purple-500/20 to-pink-500/10',
    border: 'border-purple-500/30',
    accent: 'text-purple-400',
  },
  {
    title: 'Otolith AI Neural Classifier',
    href: '/biodiversity',
    icon: Cpu,
    tag: 'CNN Vision V3.0',
    description: 'Deep transfer learning image classifier identifying 37 Indian Ocean teleost species from microscopic otolith morphology.',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/30',
    accent: 'text-emerald-400',
  },
  {
    title: 'Interactive GIS Spatial Map',
    href: '/explorer',
    icon: Compass,
    tag: 'PostGIS & GeoJSON',
    description: 'Multimodal spatial layers mapping 224 species occurrences, potential fishing zones (PFZ), and real-time AIS vessel telemetry.',
    gradient: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/30',
    accent: 'text-amber-400',
  },
  {
    title: 'Ecosystem Digital Twin',
    href: '/digital-twin',
    icon: Globe2,
    tag: 'Scenario Modeling',
    description: 'Predictive ecological simulator modeling climate warming perturbations, overfishing stress, and trophic cascade equilibria.',
    gradient: 'from-teal-500/20 to-cyan-500/10',
    border: 'border-teal-500/30',
    accent: 'text-teal-400',
  },
];

const highlights = [
  {
    title: 'LSTM Population Forecasting',
    href: '/forecast',
    icon: TrendingUp,
    description: 'Multi-step autoregressive neural forecasting for pelagic and demersal fish stocks.',
  },
  {
    title: 'Taxonomic Hierarchy (WoRMS)',
    href: '/taxonomy',
    icon: TreeDeciduous,
    description: 'Hierarchical lineage tree mapping Kingdom through Species with WoRMS AphiaID verification.',
  },
  {
    title: 'DNA 3D Biopolymer Analyzer',
    href: '/edna-shape-analyzer',
    icon: Layers,
    tag: 'Structural AI',
    description: 'Sequence-to-structure biopolymer physical property calculator and curvature estimator.',
  },
  {
    title: 'Multivariate Correlation Matrix',
    href: '/correlations',
    icon: Activity,
    description: 'Pearson and Spearman cross-variable correlation engines linking SST, salinity, and biodiversity.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070c18] text-slate-100 px-4 sm:px-6 lg:px-8 pb-20 pt-24 md:pt-28 flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-14">
        
        {/* Editorial Hero Section */}
        <section className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-[#070c18] p-8 sm:p-12 md:p-16 shadow-2xl backdrop-blur-2xl overflow-hidden">
          {/* Ambient Lighting Accents */}
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/15 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-600/15 blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-5xl space-y-6">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-4 py-1.5 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
              <span className="text-[11px] font-bold tracking-widest text-cyan-300 uppercase">RATNAKARA • OCEANOGRAPHIC INTELLIGENCE PLATFORM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08]">
              Ratnakara Marine Intelligence &amp; <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">Ocean AI Prototypes</span>
            </h1>

            {/* Editorial Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed font-normal">
              An open-source prototype platform for Indian Ocean marine science — combining 37-species otolith image classification, eDNA sequence shape analysis, fisheries forecasting models, and geospatial biodiversity records from CMLRE-sourced data.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 transition hover:brightness-110 active:scale-95"
              >
                <span>Launch Command Center</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/explorer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 hover:border-slate-600 hover:text-white"
              >
                <Compass className="h-4 w-4 text-cyan-400" />
                <span>GIS Spatial Map</span>
              </Link>
              <Link
                href="/biodiversity"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-950/40 px-6 py-3.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-900/40 hover:border-cyan-500/50"
              >
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Otolith AI Scanner</span>
              </Link>
            </div>

            {/* Metrics Ribbon */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">224</p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Species GIS Mapped</p>
              </div>
              <div className="rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">37</p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Otolith Species Classes</p>
              </div>
              <div className="rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">500</p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Occurrence Records</p>
              </div>
              <div className="rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">169</p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Mapped Stations</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid: Core Intelligence Modules */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-400">SCIENTIFIC CAPABILITIES</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide mt-1">Multi-Domain Marine Ecosystem</h2>
            </div>
            <Link href="/dashboard" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1">
              <span>View All Diagnostics</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {coreModules.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`group rounded-3xl border ${item.border} bg-gradient-to-br ${item.gradient} p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-cyan-400/60 backdrop-blur-xl flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950/80 border border-slate-800 text-white shadow-md">
                        <Icon className={`h-6 w-6 ${item.accent}`} />
                      </div>
                      <span className="rounded-full bg-slate-950/90 border border-slate-800 px-3 py-1 text-[10px] font-bold text-slate-300 font-mono">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-cyan-400">
                    <span>Explore Module</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Analytical Engines Grid */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 md:p-10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">ANALYTICAL WORKFLOWS</p>
              <h3 className="text-xl font-bold text-white tracking-wide mt-1">Deep Learning, Taxonomy &amp; Biopolymers</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Database className="h-4 w-4 text-emerald-400" />
              <span className="font-mono">PostGIS / PostgreSQLEnabled</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-5 transition hover:border-slate-700 hover:bg-slate-950 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-3 text-cyan-400">
                      <div className="h-8 w-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-cyan-400" />
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-slate-500 group-hover:text-cyan-400">
                    <span>Open Tool</span>
                    <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Enterprise Compliance Banner */}
        <section className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-slate-950 via-emerald-950/20 to-slate-950 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-lg">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">Darwin Core Standard &amp; GBIF Verified</h4>
                <span className="rounded-full bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">PRODUCTION READY</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Data pipeline implements 250+ Darwin Core terms with direct export to international oceanographic repositories.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/api-docs"
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition"
            >
              Open API Spec
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 transition"
            >
              Access Platform
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

