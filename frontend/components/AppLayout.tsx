'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';
import OtolithIdentification from '@/components/OtolithIdentification';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const MODE_KEY = 'marine-data-mode';

function FileRecords({ pathname }: { pathname: string }) {
  const [records, setRecords] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/species-locations`, { signal: controller.signal })
      .then(async response => {
        const body = await response.json();
        if (!response.ok || !body.success || !Array.isArray(body.data?.species)) throw new Error('Packaged records unavailable. Retry after the server starts.');
        setRecords(body.data.species);
      }).catch(e => { if (e.name !== 'AbortError') setError(e.message); });
    return () => controller.abort();
  }, []);
  const rows = (records || []).filter(sp => sp.scientificName.toLowerCase().includes(query.toLowerCase()));
  const locations = (records || []).reduce((sum, sp) => sum + sp.locations.length, 0);
  return <section className="mx-auto max-w-6xl space-y-6 p-5 md:p-10">
    <div><p className="text-sm uppercase tracking-widest text-cyan-300">Packaged records / File-backed mode</p>
      <h1 className="mt-2 text-3xl font-semibold">Marine data library</h1>
      <p className="mt-3 max-w-3xl text-slate-300">Browse species and locations stored in the project file. Ocean telemetry, eDNA concentrations, biomass, alerts and risk scores are not supplied by this file. Those analytics are unavailable here, rather than filled with generated measurements.</p></div>
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 text-sm text-slate-300">
      <p>Source: <code>backend/data/species_locations.json</code></p>
      <p className="mt-2">The file attributes its records to CMLRE, India. This attribution and the original records have not been independently verified. Historical records are not live observations. Counts below describe file entries, not population size or sequencing results.</p>
    </div>
    {error ? <p role="alert" className="rounded-xl border border-red-700 p-4 text-red-200">{error} <button className="underline" onClick={() => window.location.reload()}>Retry</button></p> : records === null ? <p role="status">Loading packaged records. Free hosting may need time to start...</p> : <>
      <div className="grid grid-cols-2 gap-4"><div className="rounded-xl border border-slate-700 p-5"><strong className="block text-3xl">{records.length}</strong>species entries in file</div><div className="rounded-xl border border-slate-700 p-5"><strong className="block text-3xl">{locations}</strong>species-location entries</div></div>
      <label className="block">Search scientific name<input value={query} onChange={e => setQuery(e.target.value)} className="mt-2 block w-full rounded-lg border border-slate-600 bg-slate-900 p-3" placeholder="e.g. Puerulus" /></label>
      <p className="text-sm text-slate-400">{rows.length} matching species. Showing the first 40. Location details are transcribed from the packaged file; dates use the source format.</p>
      <div className="space-y-3">{rows.slice(0, 40).map(sp => <details key={sp.scientificName} className="rounded-xl border border-slate-700 bg-slate-900 p-4"><summary className="cursor-pointer font-medium">{sp.scientificName} <span className="font-normal text-slate-400">/ {sp.locations.length} location entries</span></summary>
        <div className="mt-4 space-y-3 text-sm text-slate-300">{sp.locations.map((loc: any, i: number) => <div className="border-t border-slate-800 pt-3" key={i}><p>{loc.locality || 'Locality not supplied'} / {loc.waterBody || 'Water body not supplied'}</p><p>Coordinates: {loc.latitude}, {loc.longitude}. Source date: {loc.eventDate || 'not supplied'}. Basis: {loc.basisOfRecord || 'not supplied'}.</p></div>)}</div>
      </details>)}</div>
    </>}
    {pathname === '/biodiversity' && <div className="space-y-3"><h2 className="text-xl font-semibold">Experimental image classifier</h2><p className="text-sm text-amber-200">Separate from the records above. Model output is unvalidated, not a verified species identification.</p><OtolithIdentification /></div>}
    <a href="/edna-shape-analyzer" className="inline-block text-cyan-300 underline">Open experimental DNA shape calculator</a>
  </section>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mode, setMode] = useState<'file-backed' | 'demo' | null>(null);
  useEffect(() => {
    const demo = window.sessionStorage.getItem(MODE_KEY) === 'demo';
    // Legacy pages use fetch as well as axios. Scope this opt-in header to our backend only.
    const original = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, window.location.href);
      if (demo && url.origin === new URL(API, window.location.href).origin && url.pathname.startsWith('/api/')) {
        const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
        headers.set('X-Marine-Mode', 'demo');
        return original(input, { ...init, headers });
      }
      return original(input, init);
    };
    setMode(demo ? 'demo' : 'file-backed');
    return () => { window.fetch = original; };
  }, []);
  function switchMode() {
    if (mode === 'demo') window.sessionStorage.removeItem(MODE_KEY);
    else window.sessionStorage.setItem(MODE_KEY, 'demo');
    window.location.reload();
  }
  const calculator = pathname === '/edna-shape-analyzer';
  return <>
    <Navigation />
    <main className={`min-h-screen bg-[#070c18] text-slate-100 ${pathname === '/' ? 'pt-16' : 'pt-14 lg:ml-72 lg:pt-0'}`}>
      <div className={`sticky z-30 border-b p-4 shadow-lg ${pathname === '/' ? 'top-16' : 'top-14 lg:top-0'} ${mode === 'demo' ? 'border-amber-500 bg-amber-950 text-amber-100' : 'border-cyan-900 bg-slate-950 text-cyan-100'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="max-w-3xl text-sm"><strong>{mode === 'demo' ? 'DEMO MODE' : 'FILE-BACKED MODE'}</strong> {mode === 'demo' ? '- Generated examples, not observations, validated forecasts or live monitoring. Exports and screenshots are demonstration material only.' : '- Packaged species/location records only. Missing measurements are not generated.'}</p>
          {mode && <button className="rounded-lg border border-current px-4 py-2 text-sm" onClick={switchMode}>{mode === 'demo' ? 'Return to file-backed views' : 'Enter Demo mode'}</button>}</div>
      </div>
      {mode === null ? <p className="p-8">Loading data mode...</p> : calculator ? <><p className="m-5 rounded-lg border border-amber-700 bg-amber-950/50 p-4 text-sm text-amber-100">Experimental sequence calculator: simplified, partial lookup tables and formula fallbacks. Not an experimentally validated DNA structure predictor or species classifier. Example input is illustrative.</p>{children}</> : mode === 'demo' ? <div data-marine-mode="demo">{children}</div> : <FileRecords pathname={pathname} />}
    </main>
  </>;
}
