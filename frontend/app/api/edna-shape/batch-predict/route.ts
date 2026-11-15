import { NextRequest, NextResponse } from 'next/server';

const SERVICE_URL = process.env.PYTHON_SERVICE_URL;
const MAX_SEQUENCES = 20;

function extractSequences(text: string): string[] {
  const sequences: string[] = [];
  let current = '';
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('>')) {
      if (current) sequences.push(current);
      current = '';
      continue;
    }
    // Accept plain sequence lines; for CSV-like lines take the first field
    // that looks like DNA.
    const fields = line.split(/[,\t;]/).map((f) => f.trim().toUpperCase());
    const dnaField = fields.find((f) => /^[ACGTN]{5,}$/.test(f));
    if (dnaField) {
      if (current) {
        sequences.push(current);
        current = '';
      }
      sequences.push(dnaField);
    } else if (/^[ACGTN]+$/.test(line.toUpperCase())) {
      current += line.toUpperCase();
    }
  }
  if (current) sequences.push(current);
  return sequences.slice(0, MAX_SEQUENCES);
}

/**
 * Batch DNA shape prediction: uploaded FASTA/TXT/CSV of sequences, proxied
 * one-by-one to the deployed Python shape service and returned as CSV.
 * Returns 503 when no service is configured or reachable.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const feature = (formData.get('feature') as string) || 'MGW';
    const deepLayer = Number(formData.get('deepLayer')) || 4;

    if (!file) {
      return NextResponse.json({ success: false, error: 'file is required' }, { status: 400 });
    }

    const text = await file.text();
    const sequences = extractSequences(text);
    if (sequences.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid DNA sequences (A, C, G, T, N; min 5 bases) found in the file' },
        { status: 400 }
      );
    }

    if (!SERVICE_URL) {
      return NextResponse.json(
        { success: false, error: 'DNA shape service unavailable: no Python shape service is configured for this deployment' },
        { status: 503 }
      );
    }

    const rows: string[] = ['sequence_id,position,base,value'];
    for (let i = 0; i < sequences.length; i++) {
      let upstream: Response;
      try {
        upstream = await fetch(`${SERVICE_URL}/shape/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sequence: sequences[i], feature, enable_fl: false, deep_layer: deepLayer }),
          signal: AbortSignal.timeout(30000),
        });
      } catch {
        return NextResponse.json(
          { success: false, error: 'DNA shape service unreachable' },
          { status: 503 }
        );
      }
      if (!upstream.ok) {
        return NextResponse.json(
          { success: false, error: `DNA shape service error (${upstream.status})` },
          { status: 502 }
        );
      }
      const data = await upstream.json();
      for (const p of data.predictions) {
        rows.push(`seq_${i + 1},${p.position},${p.base},${p.value}`);
      }
    }

    return new NextResponse(rows.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="predictions-${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Batch prediction failed' },
      { status: 500 }
    );
  }
}
