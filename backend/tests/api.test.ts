import assert from 'node:assert';
import http from 'node:http';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';

async function fetchJson(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, options);
  return { status: response.status, data: await response.json() };
}

async function runTests() {
  console.log('--- Starting Ratnakara Marine Backend Integration Tests ---');
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`✗ FAIL: ${name} ->`, err.message || err);
      failed++;
    }
  };

  // Test 1: Health
  await test('GET /health returns operational status', async () => {
    const res = await fetchJson('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
  });

  // Test 2: Ocean KPIs
  await test('GET /api/ocean/kpis returns valid metrics', async () => {
    const res = await fetchJson('/api/ocean/kpis');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.avg_temperature !== undefined); // API field is snake_case, matches frontend consumer
  });

  // Test 3: Fisheries Metrics
  await test('GET /api/fisheries/metrics returns biomass & abundance', async () => {
    const res = await fetchJson('/api/fisheries/metrics');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // Test 4: eDNA stats
  await test('GET /api/edna/stats returns sequencing stats', async () => {
    const res = await fetchJson('/api/edna/stats');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // Test 5: Taxonomy tree
  await test('GET /api/taxonomy/tree returns hierarchical tree', async () => {
    const res = await fetchJson('/api/taxonomy/tree');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // Test 6: Digital Twin simulation
  await test('POST /api/digital-twin/simulate calculates trophic response', async () => {
    const res = await fetchJson('/api/digital-twin/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempDelta: 2.0, fishingPressure: 60 })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.speciesImpacts.length > 0);
  });

  // Test 7: GIS Layers
  await test('GET /api/gis/layers returns MPAs and EEZ boundaries', async () => {
    const res = await fetchJson('/api/gis/layers');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.mpas.length > 0);
  });

  // Test 8: AIS Vessel Tracking
  await test('GET /api/vessels/tracking returns active vessel positions', async () => {
    const res = await fetchJson('/api/vessels/tracking');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.count > 0);
  });

  console.log(`\nTest Summary: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runTests();
