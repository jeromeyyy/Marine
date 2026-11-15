'use client';

import { useMemo, useState } from 'react';
import { Upload, Fish, AlertCircle, CheckCircle2, Cpu, Sparkles, Layers } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type PredictionResult = {
  success?: boolean;
  species: string;
  confidence: number;
  inferenceSource?: string;
  backend?: string | null;
  validation?: string | null;
  taxonomy: {
    kingdom?: string | null;
    phylum?: string | null;
    class?: string | null;
    order?: string | null;
    family?: string | null;
    genus?: string | null;
    common_name?: string | null;
    description?: string | null;
  } | null;
  topCandidates?: Array<{ species: string; confidence: number }>;
};

export default function OtolithIdentification() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const onPredict = async () => {
    if (!file) {
      setError('Please upload or select an otolith specimen image first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE}/api/otolith/predict`, {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Prediction failed');
      }

      setResult(payload);
    } catch (e: any) {
      setError(e.message || 'Prediction failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
            <Fish className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">Otolith Image Classifier</h2>
              <span className="rounded-full bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 text-[10px] font-semibold text-amber-300">Unvalidated model</span>
            </div>
            <p className="text-xs text-slate-400">37-class MobileNetV2 artifact. Predictions are not verified identifications.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-xs font-mono text-slate-400">
            {loading ? 'Analyzing...' : result ? 'Result ready' : error ? 'Analysis failed' : 'Awaiting image'}
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Upload Column */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 rounded-xl border border-slate-800/90 bg-slate-950/60 p-4">
          <div>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 p-6 text-center transition hover:border-cyan-500/60 hover:bg-cyan-950/10">
              <Upload className="mb-2 h-7 w-7 text-cyan-400" />
              <span className="text-sm font-semibold text-slate-200">Upload Specimen Image</span>
              <span className="mt-1 text-xs text-slate-500">Supports JPEG, PNG, WebP (Max 15MB)</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0] || null;
                  setFile(selected);
                  setResult(null);
                  setError(null);
                }}
              />
            </label>

            {file && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-xs text-slate-300">
                <span className="truncate font-mono">{file.name}</span>
                <span className="text-cyan-400 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            )}
          </div>

          <button
            onClick={onPredict}
            disabled={loading || !file}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                <span>Neural Inference Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Classify Specimen</span>
              </>
            )}
          </button>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-center items-center min-h-[220px] relative overflow-hidden">
          {preview ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img src={preview} alt="Otolith preview" className="max-h-60 w-auto rounded-lg object-contain border border-slate-800 shadow-inner" />
              {loading && (
                <div className="absolute inset-0 bg-cyan-950/40 backdrop-blur-xs flex items-center justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8">
              <Layers className="mx-auto mb-2 h-10 w-10 text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Specimen Visual Telemetry Preview</p>
              <p className="text-[11px] text-slate-600 mt-1">Upload an image to render morphological examination</p>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="mt-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-950/90 to-amber-950/20 p-5 shadow-xl">
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-950/50 p-3 text-xs text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <span>{result.validation || 'Unvalidated classifier: this output is not a verified species identification.'}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white italic">{result.species}</h3>
                <span className="rounded-full bg-slate-800 border border-slate-600 px-2.5 py-0.5 text-xs font-bold text-slate-300">
                  {(result.confidence * 100).toFixed(1)}% raw score
                </span>
              </div>
              <p className="text-xs text-cyan-300 font-medium mt-0.5">{result.taxonomy?.common_name}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-400">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span className="font-mono">Engine: {result.backend || result.inferenceSource || 'ml-service'}</span>
            </div>
          </div>

          {result.taxonomy && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {[
                { label: 'Kingdom', val: result.taxonomy.kingdom },
                { label: 'Phylum', val: result.taxonomy.phylum },
                { label: 'Class', val: result.taxonomy.class },
                { label: 'Order', val: result.taxonomy.order },
                { label: 'Family', val: result.taxonomy.family },
                { label: 'Genus', val: result.taxonomy.genus },
              ].map((item, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">{item.label}</span>
                  <span className="text-xs font-semibold text-slate-200 truncate block mt-0.5">{item.val || 'N/A'}</span>
                </div>
              ))}
            </div>
          )}

          {result.taxonomy?.description && (
            <p className="mt-3 text-xs text-slate-400 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60">
              ℹ️ <span className="font-medium text-slate-300">Ecological Note:</span> {result.taxonomy.description}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
