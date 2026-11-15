import { NextRequest, NextResponse } from 'next/server';

const SERVICE_URL = process.env.PYTHON_SERVICE_URL;

/**
 * Proxy single-sequence DNA shape prediction to the deployed Python shape
 * service (ml-service edna_shape /shape/predict). Returns 503 when no
 * service is configured or reachable instead of synthesized values.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const sequence = (body.sequence || '').toUpperCase().replace(/\s/g, '');

    if (!sequence || sequence.length < 5 || !/^[ACGTN]+$/.test(sequence)) {
      return NextResponse.json(
        { success: false, error: 'A valid DNA sequence (A, C, G, T, N; min 5 bases) is required' },
        { status: 400 }
      );
    }

    if (!SERVICE_URL) {
      return NextResponse.json(
        { success: false, error: 'DNA shape service unavailable: no Python shape service is configured for this deployment' },
        { status: 503 }
      );
    }

    let upstream: Response;
    try {
      upstream = await fetch(`${SERVICE_URL}/shape/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequence,
          feature: body.feature || 'MGW',
          enable_fl: Boolean(body.enableFL),
          deep_layer: body.deepLayer || 4,
        }),
        signal: AbortSignal.timeout(30000),
      });
    } catch (fetchError: any) {
      const timedOut = fetchError?.name === 'TimeoutError';
      return NextResponse.json(
        {
          success: false,
          error: timedOut
            ? 'DNA shape service timed out: the ML service did not respond within 30 seconds. If it was idle, it may have been starting up - wait a short while and retry. If this keeps failing, the deployment has no reachable ML service.'
            : 'DNA shape service unreachable: the ML service is not configured or not reachable for this deployment. If the service was idle, it may be starting up now - wait a short while and retry. If this keeps failing, the deployment has no reachable ML service.',
        },
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
      sequence,
      feature: body.feature || 'MGW',
      predictions: data.predictions,
      statistics: data.statistics,
      method: data.method || null,
      processingTimeMs: data.processing_time_ms,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Prediction failed' },
      { status: 500 }
    );
  }
}
