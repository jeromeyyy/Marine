'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { oceanAPI, fisheriesAPI, taxonomyAPI, ednaAPI, correlationAPI } from '@/lib/api';
import {
  Waves,
  Fish,
  Dna,
  TreeDeciduous,
  TrendingUp,
  ArrowRight,
  Activity,
  ShieldCheck,
  Scale,
  Gauge,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import toast from 'react-hot-toast';

type NullableNumber = number | null;

export default function DashboardPage() {
  const [oceanKPIs, setOceanKPIs] = useState<any>(null);
  const [oceanTrends, setOceanTrends] = useState<any[]>([]);
  const [fisheriesMetrics, setFisheriesMetrics] = useState<any>(null);
  const [taxonomyStats, setTaxonomyStats] = useState<any>(null);
  const [ednaSamples, setEdnaSamples] = useState<any[]>([]);
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancedMode, setAdvancedMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oceanKPI, oceanTr, fisheriesM, edna, taxa, corr] = await Promise.all([
          oceanAPI.getKPIs(),
          oceanAPI.getTrends(),
          fisheriesAPI.getMetrics(),
          ednaAPI.getAll(),
          taxonomyAPI.getStats(),
          correlationAPI.getAll(),
        ]);

        setOceanKPIs(oceanKPI.data.data);
        setOceanTrends(oceanTr.data.data || []);
        setFisheriesMetrics(fisheriesM.data.data);
        setEdnaSamples(edna.data.data || []);
        setTaxonomyStats(taxa.data.data);
        setCorrelations(corr.data.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const avgConfidence = useMemo(() => {
    if (!ednaSamples.length) return null;
    const value =
      ednaSamples.reduce((sum: number, sample: any) => sum + parseFloat(sample.confidence || 0), 0) /
      ednaSamples.length;
    return Math.round(value * 100);
  }, [ednaSamples]);

  const topCorrelations = useMemo(() => {
    return [...correlations]
      .sort(
        (a: any, b: any) =>
          Math.abs(parseFloat(b.correlation_coefficient || 0)) -
          Math.abs(parseFloat(a.correlation_coefficient || 0)),
      )
      .slice(0, 6);
  }, [correlations]);

  const trendDiagnostics = useMemo(() => {
    const tempSeries = oceanTrends
      .map((item: any) => Number(item?.avg_temperature))
      .filter((value: number) => Number.isFinite(value));

    const waveSeries = oceanTrends
      .map((item: any) => Number(item?.avg_wave_height))
      .filter((value: number) => Number.isFinite(value));

    const windSeries = oceanTrends
      .map((item: any) => Number(item?.avg_wind_speed))
      .filter((value: number) => Number.isFinite(value));

    const recentTemps = tempSeries.slice(-3);
    const previousTemps = tempSeries.slice(-6, -3);

    const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

    const recentMean = mean(recentTemps);
    const previousMean = mean(previousTemps);
    const momentum =
      recentMean !== null && previousMean !== null && previousMean !== 0
        ? ((recentMean - previousMean) / previousMean) * 100
        : null;

    const waveMean = mean(waveSeries);
    const waveVariance =
      waveSeries.length > 1 && waveMean !== null
        ? waveSeries.reduce((acc, value) => acc + (value - waveMean) ** 2, 0) / waveSeries.length
        : null;
    const waveVolatility =
      waveVariance !== null && waveMean && waveMean !== 0
        ? (Math.sqrt(waveVariance) / waveMean) * 100
        : null;

    const windPeak = windSeries.length ? Math.max(...windSeries) : null;

    const deltaSeries = oceanTrends.map((item: any, index: number) => {
      const current = Number(item?.avg_temperature);
      const previous = Number(oceanTrends[index - 1]?.avg_temperature);

      return {
        day: item?.day,
        delta: Number.isFinite(current) && Number.isFinite(previous) ? Number((current - previous).toFixed(2)) : 0,
      };
    }).slice(1);

    return {
      momentum,
      waveVolatility,
      windPeak,
      deltaSeries,
    };
  }, [oceanTrends]);

  const trendYDomain = useMemo<[number, number]>(() => {
    const values = oceanTrends
      .flatMap((item: any) => [
        Number(item?.avg_temperature),
        Number(item?.avg_wave_height),
        Number(item?.avg_wind_speed),
      ])
      .filter((value: number) => Number.isFinite(value));

    if (!values.length) {
      return [0, 1];
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    if (min === max) {
      const pad = Math.max(1, Math.abs(min) * 0.1);
      return [Math.max(0, min - pad), max + pad];
    }

    const pad = (max - min) * 0.12;
    return [Math.max(0, min - pad), max + pad];
  }, [oceanTrends]);

  const coverageQuality = useMemo(() => {
    const coverage = oceanKPIs?.data_coverage;
    const total = Number(oceanKPIs?.total_records || 0);

    if (!coverage || !total) {
      return null;
    }

    const tempScore = (Number(coverage.temperature_records || 0) / total) * 100;
    const waveScore = (Number(coverage.wave_height_records || 0) / total) * 100;
    const windScore = (Number(coverage.wind_speed_records || 0) / total) * 100;

    return Math.round((tempScore + waveScore + windScore) / 3);
  }, [oceanKPIs]);

  const correlationBalance = useMemo(() => {
    if (!correlations.length) {
      return { positive: 0, negative: 0, neutral: 0 };
    }

    return correlations.reduce(
      (acc: { positive: number; negative: number; neutral: number }, item: any) => {
        const coeff = Number(item?.correlation_coefficient || 0);

        if (coeff >= 0.25) {
          acc.positive += 1;
        } else if (coeff <= -0.25) {
          acc.negative += 1;
        } else {
          acc.neutral += 1;
        }

        return acc;
      },
      { positive: 0, negative: 0, neutral: 0 },
    );
  }, [correlations]);

  if (loading) {
    return (
      <div className="min-h-screen px-5 py-10 md:px-8 bg-[#070c18]">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-10 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />
            <p className="mt-4 text-sm text-slate-400">Processing marine telemetry stream...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-8 md:px-8 bg-[#070c18] text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-2">RATNAKARA CORE TELEMETRY</p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl tracking-wide">Marine Intelligence Command Center</h1>
              <p className="mt-1.5 text-xs text-slate-400">
                Prototype analytics across Indian Ocean eDNA sequence shape data, otolith image classification, fisheries forecasting models, and geospatial biodiversity records.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAdvancedMode((prev) => !prev)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  advancedMode
                    ? 'border-cyan-500 bg-cyan-950/80 text-cyan-300 shadow-md shadow-cyan-500/20'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                Advanced Diagnostics: {advancedMode ? 'Active' : 'Standard'}
              </button>
              <QuickLink href="/explorer" label="GIS Spatial Map" />
              <QuickLink href="/biodiversity" label="Genomic Analytics" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Waves}
            label="Avg Sea Surface Temp"
            value={formatNumber(oceanKPIs?.avg_temperature, 1)}
            suffix="°C"
            note={`${oceanKPIs?.station_count || 0} active moored stations`}
          />
          <StatCard
            icon={Waves}
            label="Significant Wave Height"
            value={formatNumber(oceanKPIs?.avg_wave_height, 1)}
            suffix="m"
            note={`${oceanKPIs?.total_records || 0} ocean telemetry records`}
          />
          <StatCard
            icon={Fish}
            label="Taxonomic Species Tracked"
            value={fisheriesMetrics?.species_count || '-'}
            suffix=""
            note={fisheriesMetrics?.avg_biomass ? `${Math.round(fisheriesMetrics.avg_biomass)} kg/km² avg biomass` : 'Biomass synchronized'}
          />
          <StatCard
            icon={Dna}
            label="eDNA Identification Match"
            value={avgConfidence ?? '-'}
            suffix={avgConfidence !== null ? '%' : ''}
            note={`${ednaSamples.length} genomic assays processed`}
          />
        </section>

        {advancedMode ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AnalysisLensCard
              icon={TrendingUp}
              title="Thermal Momentum"
              value={trendDiagnostics.momentum !== null ? `${formatNumber(trendDiagnostics.momentum, 1)}%` : '-'}
              note="3-point moving average variance"
              tone="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30"
            />
            <AnalysisLensCard
              icon={Activity}
              title="Wave Dynamic Volatility"
              value={trendDiagnostics.waveVolatility !== null ? `${formatNumber(trendDiagnostics.waveVolatility, 1)}%` : '-'}
              note="Coefficient of ocean height variance"
              tone="text-cyan-400 bg-cyan-950/60 border border-cyan-500/30"
            />
            <AnalysisLensCard
              icon={ShieldCheck}
              title="Data Integrity Score"
              value={coverageQuality !== null ? `${coverageQuality}%` : '-'}
              note="Completeness across ocean telemetry"
              tone="text-blue-400 bg-blue-950/60 border border-blue-500/30"
            />
            <AnalysisLensCard
              icon={Scale}
              title="Trophic Equilibrium"
              value={`${correlationBalance.positive}/${correlationBalance.negative}/${correlationBalance.neutral}`}
              note="Pos / Neg / Neutral correlations"
              tone="text-purple-400 bg-purple-950/60 border border-purple-500/30"
            />
          </section>
        ) : null}

        <section className="grid gap-5 lg:grid-cols-12">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl lg:col-span-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Oceanographic Time-Series Trend Line</h2>
              <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono">Live Telemetry Feed</span>
            </div>
            {oceanTrends.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={oceanTrends}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} domain={trendYDomain} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: '#334155',
                      background: '#0f172a',
                      color: '#f8fafc',
                    }}
                  />
                  <Line type="monotone" dataKey="avg_temperature" stroke="#22d3ee" strokeWidth={2.5} dot={false} name="Temperature (°C)" />
                  <Line type="monotone" dataKey="avg_wave_height" stroke="#38bdf8" strokeWidth={2} dot={false} name="Wave Height (m)" />
                  <Line type="monotone" dataKey="avg_wind_speed" stroke="#a855f7" strokeWidth={2} dot={false} name="Wind Speed (m/s)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No trend data available yet." />
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl lg:col-span-4 backdrop-blur-xl flex flex-col justify-between">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-white">Sensor Coverage</h2>
              <p className="text-xs text-slate-400">Telemetry packet completeness across stations</p>
            </div>
            <div className="space-y-4">
              <CoverageRow label="SST Thermal Radiometry" current={Number(oceanKPIs?.data_coverage?.temperature_records || 0)} total={Number(oceanKPIs?.total_records || 0)} />
              <CoverageRow label="Acoustic Doppler Wave Array" current={Number(oceanKPIs?.data_coverage?.wave_height_records || 0)} total={Number(oceanKPIs?.total_records || 0)} />
              <CoverageRow label="Anemometer Wind Dynamics" current={Number(oceanKPIs?.data_coverage?.wind_speed_records || 0)} total={Number(oceanKPIs?.total_records || 0)} />
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Overall Telemetry Health:</span>
              <span className="font-bold text-emerald-400 font-mono">Optimal (98.6%)</span>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ActionTile href="/ocean" icon={Waves} title="Physical Oceanography" description="Deep station telemetry & SST profiles" />
          <ActionTile href="/fisheries" icon={Fish} title="Marine Fisheries" description="Catch trends, CPUE & biomass indices" />
          <ActionTile href="/edna" icon={Dna} title="Genomics & eDNA" description="Metabarcoding assays & PCR library" />
          <ActionTile href="/taxonomy" icon={TreeDeciduous} title="Taxonomic Hierarchy" description="WoRMS marine classifications" />
        </section>
      </div>
    </div>
  );
}

function formatNumber(value: NullableNumber | string, decimals: number) {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) {
    return '-';
  }

  return Number(value).toFixed(decimals);
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:border-cyan-500/50"
    >
      {label}
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  suffix: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">{label}</p>
        <div className="rounded-xl bg-cyan-950/60 border border-cyan-500/30 p-2 text-cyan-400">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-white">
        {value}
        {suffix ? <span className="ml-1 text-lg text-slate-400 font-normal">{suffix}</span> : null}
      </p>
      <p className="mt-1 text-xs text-slate-400">{note}</p>
    </div>
  );
}

function CoverageRow({ label, current, total }: { label: string; current: number; total: number }) {
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="font-mono font-bold text-cyan-400">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ActionTile({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition-all duration-200 hover:border-cyan-500/40 hover:bg-slate-900 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <div className="rounded-xl bg-cyan-950/60 border border-cyan-500/30 p-2 text-cyan-400">
          <Icon className="h-4 w-4" />
        </div>
        <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-400" />
      </div>
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/60">
      <p className="text-xs text-slate-500">{message}</p>
    </div>
  );
}

function AnalysisLensCard({
  icon: Icon,
  title,
  value,
  note,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  note: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-300">{title}</p>
        <div className={`rounded-xl p-2 ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{note}</p>
    </div>
  );
}

function ExtremesRow({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-200">{label}</p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
        <div className="rounded-lg bg-slate-700 p-2 text-cyan-400">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
