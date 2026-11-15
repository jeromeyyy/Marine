import { NextRequest, NextResponse } from 'next/server';

const SERVICE_URL = process.env.PYTHON_SERVICE_URL;

/**
 * Proxy two-sequence DNA shape comparison to the deployed Python shape
 * service (/shape/compare). Returns 503 when no service is configured or
 * reachable instead of synthesized values.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const sequence1 = (body.sequence1 || '').toUpperCase().replace(/\s/g, '');
    const sequence2 = (body.sequence2 || '').toUpperCase().replace(/\s/g, '');

    for (const seq of [sequence1, sequence2]) {
      if (!seq || seq.length < 5 || !/^[ACGTN]+$/.test(seq)) {
        return NextResponse.json(
          { success: false, error: 'Both sequences must be valid DNA (A, C, G, T, N; min 5 bases)' },
          { status: 400 }
        );
      }
    }

    if (!SERVICE_URL) {
      return NextResponse.json(
        { success: false, error: 'DNA shape service unavailable: no Python shape service is configured for this deployment' },
        { status: 503 }
      );
    }

    let upstream: Response;
    try {
      upstream = await fetch(`${SERVICE_URL}/shape/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequence1,
          sequence2,
          feature: body.feature || 'MGW',
        }),
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
    return NextResponse.json({
      success: true,
      sequence1,
      sequence2,
      feature: body.feature || 'MGW',
      difference: data.difference,
      similarity: data.similarity,
      method: data.method || null,
      processingTimeMs: data.processing_time_ms,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Comparison failed' },
      { status: 500 }
    );
  }
}
