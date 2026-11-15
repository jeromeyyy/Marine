import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

const execAsync = promisify(exec);

interface PredictionRequest {
  sequences: string[];
  feature: string;
  fluctuation?: boolean;
  layer?: number;
  mode?: 'predict' | 'batch' | 'species-classify' | 'ecological-metrics';
}

interface PredictionResult {
  success: boolean;
  sequences?: Array<{
    id: string;
    sequence: string;
    predictions: Array<{
      position: number;
      base: string;
      value: number;
    }>;
  }>;
  feature?: string;
  fluctuation?: boolean;
  layer?: number;
  statistics?: {
    mean: number;
    std: number;
    min: number;
    max: number;
  };
  confidence?: number;
  processingTime?: number;
  species?: Array<{
    species: string;
    probability: number;
    confidence: number;
  }>;
  biodiversityIndex?: number;
  speciesRichness?: number;
  anomalyScore?: number;
  dominantCluster?: string;
  error?: string;
}


/**
 * Call Python pipeline service
 * Tries HTTP endpoint first, falls back to direct Python execution
 */
async function callPythonPipeline(payload: any): Promise<PredictionResult> {
  // Try HTTP service first (if Python service running)
  try {
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8001';
    const response = await fetch(`${pythonServiceUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (httpError) {
    console.log('Python HTTP service unavailable, falling back to direct execution');
  }

  // Fallback: Execute Python directly using child_process
  try {
    const pythonPath = path.join(process.cwd(), '..', 'marine-pipeline-service', 'pipelines', 'deep_dna_shape_pipeline.py');

    // Create temporary JSON file
    const tempDir = path.join(os.tmpdir(), 'ratnakara-deep-shape');
    await fs.mkdir(tempDir, { recursive: true });
    const tempFile = path.join(tempDir, `deep_shape_${Date.now()}.json`);
    await fs.writeFile(tempFile, JSON.stringify(payload));

    // Execute Python script (try multiple commands for cross-platform compatibility)
    const pythonCandidates = process.platform === 'win32'
      ? ['py -3', 'python', 'python3']
      : ['python3', 'python'];

    let stdout = '';
    let lastError: any = null;

    for (const candidate of pythonCandidates) {
      try {
        const result = await execAsync(`${candidate} "${pythonPath}" "${tempFile}"`);
        stdout = result.stdout;
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (lastError) {
      throw lastError;
    }

    // Clean up temp file
    await fs.unlink(tempFile).catch(() => {});

    return JSON.parse(stdout);
  } catch (pythonError) {
    console.error('Python execution failed:', pythonError);
    // No silent synthesized values: report the service as unavailable.
    return {
      success: false,
      error:
        'Deep DNA shape service unavailable: no reachable Python shape service ' +
        '(set PYTHON_SERVICE_URL) and no local pipeline on this host',
    };
  }
}

/**
 * POST /api/edna/deep-shape
 * Handles DNA shape predictions with multiple modes
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: PredictionRequest = await request.json();
    const mode = body.mode || 'predict';

    // Validation
    if (!body.sequences || !Array.isArray(body.sequences) || body.sequences.length === 0) {
      return NextResponse.json(
        { success: false, error: 'sequences array required' },
        { status: 400 }
      );
    }

    if (!body.feature && mode !== 'ecological-metrics') {
      return NextResponse.json(
        { success: false, error: 'feature required' },
        { status: 400 }
      );
    }

    // Validate sequences
    const validSequences = body.sequences.filter((seq) => {
      const clean = seq.toUpperCase().replace(/\s/g, '');
      return /^[ACGTN]+$/.test(clean) && clean.length > 0;
    });

    if (validSequences.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid sequences provided' },
        { status: 400 }
      );
    }

    const layer = body.layer || 4;
    const fluctuation = body.fluctuation || false;

    // Prepare payload
    const payload = {
      sequences: validSequences,
      feature: body.feature || 'MGW',
      layer,
      fluctuation,
      mode,
    };

    // Call Python pipeline
    const result = await callPythonPipeline(payload);

    if (!result.success) {
      return NextResponse.json(result, { status: 503 });
    }

    // Handle batch mode (return CSV)
    if (mode === 'batch') {
      const csv = generateCSV(result);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="deep-shape-${Date.now()}.csv"`,
        },
      });
    }

    // Return JSON for other modes
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Request processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Generate CSV from prediction results
 */
function generateCSV(result: PredictionResult): string {
  const rows = ['sequence_id,position,base,value'];

  if (result.sequences) {
    for (const seq of result.sequences) {
      for (const pred of seq.predictions) {
        rows.push(`${seq.id},${pred.position},${pred.base},${pred.value.toFixed(4)}`);
      }
    }
  }

  return rows.join('\n');
}

/**
 * GET /api/edna/deep-shape
 * Health check endpoint
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'operational',
    service: 'Deep DNAshape API',
    timestamp: new Date().toISOString(),
  });
}
