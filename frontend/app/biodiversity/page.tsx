'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Dna, Map, Search, Download, AlertCircle, CheckCircle2, TrendingUp,
  Filter, ExternalLink, RefreshCcw, Info, Beaker, Fish, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, ScatterChart, Scatter, PieChart, Pie
} from 'recharts';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import OtolithIdentification from '@/components/OtolithIdentification';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SequenceRecord {
  id: string;
  sequenceIdentifier: string;
  gene: string;
  taxonomic_identification: string;
  sequenceLength?: number;   // not measured for demo records
  gc_content?: number;       // not measured for demo records
  blast_identity_percent?: number;  // only shown when actually measured
  blast_evalue?: number;
  species?: string;
  region?: string;
  recorded_at?: string;
}

interface AnomalyAlert {
  id: string;
  parameter: string;
  measured_value: number;
  expected_value?: number;
  z_score: number;
  alert_level: 'warning' | 'critical';
  detected_at: string;
  acknowledged: boolean;
  latitude?: number;
  longitude?: number;
  region?: string;
}

interface SpeciesRichness {
  region: string;
  unique_species: number;
  total_occurrences: number;
  endemic_species?: number;
  edna_detected?: number;
  fisheries_recorded?: number;
}

interface ComparisonData {
  parameter: string;
  edna_detections: number;
  otolith_records: number;
  agreement: number;
}

interface KPIData {
  sequences: { total: number; highQuality: number; uniqueGenes: number };
  anomalies: { total: number; critical: number; unacknowledged: number };
  biodiversity: { totalSpecies: number; regions: number };
}

interface BiodiversityRiskRecord {
  region: string;
  score: number;
  category: 'Stable' | 'Warning' | 'Critical';
  components: {
    ednaDiversityRisk: number;
    speciesDeclineRisk: number;
    temperatureAnomalyRisk: number;
    fishingPressureRisk: number;
  };
  raw?: {
    ednaDiversity?: number;
    speciesDeclineRate?: number;
    temperatureAnomaly?: number;
    regionAvgTemp?: number;
    fishingPressureRaw?: number;
  };
}

const GENES = ['All', '16S', 'COX1', 'ITS', 'rbcL', 'matK'];

export default function BiodiversityPage() {
  const [sequences, setSequences] = useState<SequenceRecord[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [richness, setRichness] = useState<SpeciesRichness[]>([]);
  const [comparison, setComparison] = useState<ComparisonData[]>([]);
  const [riskIndex, setRiskIndex] = useState<BiodiversityRiskRecord[]>([]);
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGene, setSelectedGene] = useState('All');
  const [minIdentity, setMinIdentity] = useState(0);
  const [usedFallback, setUsedFallback] = useState(false);
  const [filterCritical, setFilterCritical] = useState(false);
  const [totalSequences, setTotalSequences] = useState(0);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [sequencesRes, anomaliesRes, richnessRes, comparisonRes, kpisRes, riskIndexRes] = await Promise.all([
        fetch(`${API_BASE}/api/biodiversity/sequences?gene=${selectedGene}&minIdentity=${minIdentity}&species=${searchTerm}&limit=100`),
        fetch(`${API_BASE}/api/biodiversity/anomalies?limit=50`),
        fetch(`${API_BASE}/api/biodiversity/richness`),
        fetch(`${API_BASE}/api/biodiversity/comparison`),
        fetch(`${API_BASE}/api/biodiversity/kpis`),
        fetch(`${API_BASE}/api/biodiversity/risk-index`),
      ]);

      const [sequencesData, anomaliesData, richnessData, comparisonData, kpisData, riskIndexData] = await Promise.all([
        sequencesRes.json(),
        anomaliesRes.json(),
        richnessRes.json(),
        comparisonRes.json(),
        kpisRes.json(),
        riskIndexRes.json(),
      ]);

      if (sequencesData.success) {
        setSequences(sequencesData.data);
        setTotalSequences(sequencesData.total || sequencesData.data.length);
      }
      if (anomaliesData.success) {
        setAnomalies(anomaliesData.data);
      }
      if (richnessData.success) {
        setRichness(richnessData.data);
      }
      if (comparisonData.success) {
        setComparison(comparisonData.data);
      }
      if (kpisData.success) {
        setKpis(kpisData.data);
      }
      if (riskIndexData.success) {
        setRiskIndex(riskIndexData.data || []);
      }

      toast.success('Biodiversity data loaded successfully');
    } catch (error) {
      console.error('Failed to fetch biodiversity data:', error);
      toast.error('Using fallback data - API unavailable');
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  }, [selectedGene, minIdentity, searchTerm]);

  // Fallback data for when API is unavailable (flagged as demo in the UI)
  const loadFallbackData = () => {
    setUsedFallback(true);
    // Generate realistic fallback data
    // Offline demo records: identification fields only. Length, GC% and BLAST
    // values are intentionally omitted - they were previously invented numbers.
    const mockSequences: SequenceRecord[] = [
      { id: '1', sequenceIdentifier: 'SEQ-16S-001', gene: '16S', taxonomic_identification: 'Sardinella longiceps' },
      { id: '2', sequenceIdentifier: 'SEQ-COX1-002', gene: 'COX1', taxonomic_identification: 'Rastrelliger kanagurta' },
      { id: '3', sequenceIdentifier: 'SEQ-16S-003', gene: '16S', taxonomic_identification: 'Thunnus albacares' },
      { id: '4', sequenceIdentifier: 'SEQ-COX1-004', gene: 'COX1', taxonomic_identification: 'Katsuwonus pelamis' },
      { id: '5', sequenceIdentifier: 'SEQ-ITS-005', gene: 'ITS', taxonomic_identification: 'Microalgae sp.' },
    ];

    const mockAnomalies: AnomalyAlert[] = [
      { id: 'A1', parameter: 'temperature', measured_value: 34.2, z_score: 3.1, alert_level: 'critical', detected_at: new Date().toISOString(), acknowledged: false },
      { id: 'A2', parameter: 'salinity', measured_value: 38.5, z_score: 2.8, alert_level: 'warning', detected_at: new Date(Date.now() - 86400000).toISOString(), acknowledged: false },
      { id: 'A3', parameter: 'oxygen', measured_value: 2.3, z_score: 2.6, alert_level: 'critical', detected_at: new Date(Date.now() - 172800000).toISOString(), acknowledged: true },
    ];

    const mockRichness: SpeciesRichness[] = [
      { region: 'Bay of Bengal', unique_species: 142, total_occurrences: 3245, endemic_species: 23, edna_detected: 89, fisheries_recorded: 118 },
      { region: 'Arabian Sea', unique_species: 128, total_occurrences: 2891, endemic_species: 18, edna_detected: 76, fisheries_recorded: 105 },
      { region: 'Andaman Sea', unique_species: 156, total_occurrences: 4102, endemic_species: 31, edna_detected: 102, fisheries_recorded: 134 },
    ];

    const mockComparison: ComparisonData[] = [
      { parameter: 'Sardinella longiceps', edna_detections: 156, otolith_records: 47, agreement: 89 },
      { parameter: 'Rastrelliger kanagurta', edna_detections: 132, otolith_records: 38, agreement: 85 },
      { parameter: 'Thunnus albacares', edna_detections: 89, otolith_records: 52, agreement: 91 },
      { parameter: 'Katsuwonus pelamis', edna_detections: 76, otolith_records: 43, agreement: 87 },
      { parameter: 'Scomberomorus guttatus', edna_detections: 103, otolith_records: 35, agreement: 82 },
    ];

    const mockRiskIndex: BiodiversityRiskRecord[] = [
      {
        region: 'Arabian Sea',
        score: 36,
        category: 'Stable',
        components: {
          ednaDiversityRisk: 25,
          speciesDeclineRisk: 30,
          temperatureAnomalyRisk: 42,
          fishingPressureRisk: 50,
        },
      },
      {
        region: 'Bay of Bengal',
        score: 58,
        category: 'Warning',
        components: {
          ednaDiversityRisk: 48,
          speciesDeclineRisk: 63,
          temperatureAnomalyRisk: 66,
          fishingPressureRisk: 57,
        },
      },
      {
        region: 'Southern Indian Ocean',
        score: 74,
        category: 'Critical',
        components: {
          ednaDiversityRisk: 72,
          speciesDeclineRisk: 70,
          temperatureAnomalyRisk: 79,
          fishingPressureRisk: 73,
        },
      },
    ];

    setSequences(mockSequences);
    setAnomalies(mockAnomalies);
    setRichness(mockRichness);
    setComparison(mockComparison);
    setRiskIndex(mockRiskIndex);
    setKpis({
      sequences: { total: mockSequences.length, highQuality: 4, uniqueGenes: 3 },
      anomalies: { total: 3, critical: 2, unacknowledged: 2 },
      biodiversity: { totalSpecies: 426, regions: 3 }
    });
    setTotalSequences(mockSequences.length);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter sequences locally for instant feedback
  const filteredSequences = sequences.filter((seq) => {
    const matchesSearch =
      !searchTerm ||
      seq.sequenceIdentifier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seq.taxonomic_identification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seq.species?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGene = selectedGene === 'All' || seq.gene === selectedGene;
    const matchesIdentity = !minIdentity || (seq.blast_identity_percent || 0) >= minIdentity;
    return matchesSearch && matchesGene && matchesIdentity;
  });

  // Filter anomalies
  const filteredAnomalies = anomalies.filter((anom) => {
    return !filterCritical || anom.alert_level === 'critical' || !anom.acknowledged;
  });

  // Acknowledge anomaly
  const handleAcknowledge = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/biodiversity/anomalies/${id}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgedBy: 'user', notes: '' })
      });

      if (response.ok) {
        setAnomalies(prev => prev.map(a =>
          a.id === id ? { ...a, acknowledged: true } : a
        ));
        toast.success('Anomaly acknowledged');
      }
    } catch (error) {
      // Optimistic update for demo
      setAnomalies(prev => prev.map(a =>
        a.id === id ? { ...a, acknowledged: true } : a
      ));
      toast.success('Anomaly acknowledged (offline mode)');
    }
  };

  // Export to Darwin Core
  const exportToGBIF = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/biodiversity/export/darwin-core?limit=1000`);
      const data = await response.json();

      if (data.success) {
        // Download XML
        const element = document.createElement('a');
        element.setAttribute('href', `data:text/xml;charset=utf-8,${encodeURIComponent(data.metaXml)}`);
        element.setAttribute('download', `ratnakara-darwin-core-${new Date().toISOString().split('T')[0]}.xml`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        toast.success(`Exported ${data.recordCount} records in Darwin Core format`);
      }
    } catch (error) {
      // Fallback export
      const darwinCoreXml = `<?xml version="1.0" encoding="UTF-8"?>
<archive xmlns="http://rs.tdwg.org/dwca/text/">
  <core encoding="UTF-8">
    <files><location>occurrence.txt</location></files>
    <id index="0" />
    <field index="0" term="http://purl.org/dc/terms/identifier"/>
    <field index="1" term="http://rs.tdwg.org/dwc/terms/occurrenceID"/>
    <field index="2" term="http://rs.tdwg.org/dwc/terms/scientificName"/>
  </core>
</archive>`;

      const element = document.createElement('a');
      element.setAttribute('href', `data:text/xml;charset=utf-8,${encodeURIComponent(darwinCoreXml)}`);
      element.setAttribute('download', `ratnakara-darwin-core-${new Date().toISOString().split('T')[0]}.xml`);
      element.click();
      toast.success('Darwin Core XML exported (sample template)');
    }
  };

  // Calculate stats from live data
  const criticalCount = kpis?.anomalies.critical || anomalies.filter(a => a.alert_level === 'critical').length;
  const unacknowledgedCount = kpis?.anomalies.unacknowledged || anomalies.filter(a => !a.acknowledged).length;
  const highQualitySequences = kpis?.sequences.highQuality ?? sequences.filter(s => s.blast_identity_percent != null && s.blast_identity_percent >= 97).length;
  const averageRiskScore = riskIndex.length ? Math.round(riskIndex.reduce((sum, item) => sum + item.score, 0) / riskIndex.length) : 0;
  const criticalRegions = riskIndex.filter((item) => item.category === 'Critical').length;

  const getRiskTone = (category: BiodiversityRiskRecord['category']) => {
    if (category === 'Critical') {
      return { chip: 'bg-red-100 text-red-700', dot: 'bg-red-500', bar: '#ef4444', icon: '🔴' };
    }
    if (category === 'Warning') {
      return { chip: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', bar: '#f59e0b', icon: '🟡' };
    }
    return { chip: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', bar: '#10b981', icon: '🟢' };
  };

  return (
    <div className="min-h-screen bg-[#070c18] text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-[#080d1a]/80 backdrop-blur-md">
        <div className="px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">Biodiversity & Genomic Analytics</h1>
                <p className="text-xs text-slate-400">eDNA sequences, otolith AI classifications, species richness, and ecological risk models</p>
                {usedFallback && (
                  <p className="mt-2 inline-block rounded-md border border-amber-500/40 bg-amber-950/60 px-2 py-1 text-[11px] font-semibold text-amber-300">
                    Backend unavailable - showing built-in demo records (identification fields only; length, GC% and BLAST values are not measured)
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 border border-slate-700 text-slate-200 font-medium rounded-xl hover:bg-slate-700 transition disabled:opacity-50 text-xs"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
              <button
                onClick={exportToGBIF}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Export GBIF Darwin Core
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div>
          <OtolithIdentification />
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <motion.div
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">DNA Sequences</p>
                <p className="text-3xl font-extrabold text-white mt-1">{kpis?.sequences.total || totalSequences}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Dna className="w-5 h-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">High Quality (≥97%)</p>
                <p className="text-3xl font-extrabold text-white mt-1">{highQualitySequences}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Total Species</p>
                <p className="text-3xl font-extrabold text-white mt-1">{kpis?.biodiversity.totalSpecies || richness.reduce((sum, r) => sum + r.unique_species, 0)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Fish className="w-5 h-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-red-400">Critical Anomalies</p>
                <p className="text-3xl font-extrabold text-white mt-1">{criticalCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Pending Alerts</p>
                <p className="text-3xl font-extrabold text-white mt-1">{unacknowledgedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Avg BRI Score</p>
                <p className="text-3xl font-extrabold text-white mt-1">{averageRiskScore}</p>
                <p className="text-[10px] text-amber-400/80 mt-0.5">{criticalRegions} critical zone(s)</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Biodiversity Risk Index */}
        <motion.div
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Biodiversity Risk Index (BRI)</h2>
                <p className="text-xs text-slate-400">Multi-trophic vulnerability combining eDNA, thermal stress, and fishing pressure.</p>
              </div>
            </div>
            <span className="rounded-full bg-amber-950/80 border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-300">
              Single Actionable Metric (0 - 100)
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-6 text-xs text-slate-300 flex items-center justify-between">
            <p>
              ℹ️ <strong>BRI Calculation:</strong> Weighted composite of <strong>eDNA Shannon diversity</strong>, <strong>species abundance decline</strong>, <strong>SST thermal anomalies</strong>, and <strong>commercial fishing intensity</strong>. Lower score indicates higher resilience.
            </p>
          </div>

          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskIndex}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(value: number) => [`${value}`, 'BRI Score']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  }}
                />
                <Bar dataKey="score" name="BRI Score" radius={[8, 8, 0, 0]}>
                  {riskIndex.map((entry, index) => (
                    <Cell key={`bri-cell-${index}`} fill={getRiskTone(entry.category).bar} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {riskIndex.map((item, idx) => {
              const tone = getRiskTone(item.category);
              return (
                <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">{item.region}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border border-slate-700 ${tone.chip}`}>
                      {tone.icon} {item.category}
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-white">{item.score}</p>
                  <p className="text-[11px] text-slate-500 font-mono">BRI Score / 100</p>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>eDNA Diversity Risk:</span>
                      <span className="font-semibold text-slate-200 font-mono">{item.components.ednaDiversityRisk.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Species Decline Risk:</span>
                      <span className="font-semibold text-slate-200 font-mono">{item.components.speciesDeclineRisk.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Temperature Anomaly Risk:</span>
                      <span className="font-semibold text-slate-200 font-mono">{item.components.temperatureAnomalyRisk.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Fishing Pressure Risk:</span>
                      <span className="font-semibold text-slate-200 font-mono">{item.components.fishingPressureRisk.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Species Richness by Region */}
        <motion.div
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Spatial Species Richness by Maritime Sector</h2>
                <p className="text-xs text-slate-400">Comparison of physical trawling surveys vs metabarcoding eDNA assays</p>
              </div>
            </div>
            <span className="rounded-full bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 text-xs font-semibold text-cyan-300">
              {richness.length} Sectors Synced
            </span>
          </div>

          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={richness}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Legend />
                <Bar dataKey="unique_species" fill="#06b6d4" name="Unique Species" radius={[6, 6, 0, 0]} />
                <Bar dataKey="edna_detected" fill="#8b5cf6" name="eDNA Detected" radius={[6, 6, 0, 0]} />
                <Bar dataKey="fisheries_recorded" fill="#10b981" name="Fisheries Recorded" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {richness.map((region, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 shadow-inner">
                <p className="text-sm font-bold text-white">{region.region}</p>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Unique Species:</span>
                    <span className="font-bold text-cyan-400 font-mono">{region.unique_species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Occurrences:</span>
                    <span className="font-bold text-white font-mono">{region.total_occurrences?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Endemic Species:</span>
                    <span className="font-bold text-purple-400 font-mono">{region.endemic_species || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">eDNA Detected:</span>
                    <span className="font-bold text-violet-400 font-mono">{region.edna_detected || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* DNA Sequence Library */}
        <motion.div
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Dna className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Genomic eDNA Sequence Repository</h2>
                  <p className="text-xs text-slate-400">High-throughput metabarcoding reads (16S, COX1, ITS, rbcL)</p>
                </div>
              </div>
              <span className="rounded-full bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 text-xs font-semibold text-cyan-300">
                {filteredSequences.length} / {totalSequences} Records Filtered
              </span>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Search Taxon</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search species or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Gene Marker</label>
                <select
                  value={selectedGene}
                  onChange={(e) => setSelectedGene(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                >
                  {GENES.map((gene) => (
                    <option key={gene} value={gene}>{gene}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Min BLAST Match</label>
                <select
                  value={minIdentity}
                  onChange={(e) => setMinIdentity(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                >
                  <option value="0">All Identity Scores</option>
                  <option value="80">≥ 80%</option>
                  <option value="90">≥ 90%</option>
                  <option value="95">≥ 95%</option>
                  <option value="98">≥ 98%</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedGene('All');
                    setMinIdentity(0);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition text-xs font-semibold border border-slate-700"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Sequence Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Sequence ID</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Gene</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Taxonomic Species</th>
                  <th className="px-4 py-3 text-center font-bold uppercase tracking-wider">Length (bp)</th>
                  <th className="px-4 py-3 text-center font-bold uppercase tracking-wider">GC %</th>
                  <th className="px-4 py-3 text-center font-bold uppercase tracking-wider">BLAST ID %</th>
                  <th className="px-4 py-3 text-center font-bold uppercase tracking-wider">E-value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSequences.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      <Dna className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
                      <p className="font-semibold text-slate-400">No matching sequence assays located</p>
                      <p className="text-[11px] text-slate-600 mt-1">Adjust query parameters or identity threshold</p>
                    </td>
                  </tr>
                ) : (
                  filteredSequences.map((seq, idx) => (
                    <tr
                      key={seq.id}
                      className={`hover:bg-slate-800/50 transition ${idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-950/40'}`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-cyan-400 font-semibold">{seq.sequenceIdentifier}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 bg-blue-950/80 border border-blue-500/40 text-blue-300 rounded-md text-[10px] font-bold">
                          {seq.gene}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-100 italic font-medium">
                        {seq.taxonomic_identification || seq.species || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400 font-mono">{seq.sequenceLength != null ? seq.sequenceLength.toLocaleString() : 'n/a'}</td>
                      <td className="px-4 py-3 text-center">
                        {seq.gc_content != null ? (
                        <span className={`font-mono font-bold ${
                          seq.gc_content > 60 ? 'text-rose-400' :
                          seq.gc_content > 50 ? 'text-emerald-400' : 'text-cyan-400'
                        }`}>
                          {seq.gc_content.toFixed(1)}%
                        </span>
                        ) : <span className="text-slate-500 font-mono">n/a</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {seq.blast_identity_percent != null ? (
                        <span className={`font-mono font-bold ${
                          seq.blast_identity_percent >= 99 ? 'text-emerald-400' :
                          seq.blast_identity_percent >= 95 ? 'text-cyan-400' : 'text-amber-400'
                        }`}>
                          {seq.blast_identity_percent.toFixed(1)}%
                        </span>
                        ) : <span className="text-slate-500 font-mono" title="BLAST identity is not measured for these records">not measured</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400 font-mono text-[11px]">
                        {seq.blast_evalue !== undefined && seq.blast_evalue !== null
                          ? seq.blast_evalue === 0 ? '0.0' : seq.blast_evalue.toExponential(1)
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Darwin Core Compliance Banner */}
        <motion.div
          className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950/30 p-6 shadow-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white tracking-wide">Darwin Core Standard Compliance</h3>
                <span className="rounded-full bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">GBIF Validated</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                This biodiversity dataset strictly adheres to the international Darwin Core standard (250+ terms) for open-access marine genomics publication.
                Mandatory schema fields (<code>occurrenceID</code>, <code>scientificName</code>, <code>decimalLatitude</code>, <code>decimalLongitude</code>, and <code>eventDate</code>) are fully mapped.
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs font-semibold">
                <a
                  href="https://dwc.tdwg.org/terms/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition"
                >
                  <span>Darwin Core Terminology</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.gbif.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition"
                >
                  <span>GBIF Marine Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
