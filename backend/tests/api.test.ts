import assert from 'node:assert';
import fs from 'node:fs';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';

async function fetchJson(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}${path.includes('?') ? '&' : '?'}mode=demo`;
  const response = await fetch(url, options);
  return { status: response.status, data: await response.json() };
}

async function runTests() {
  console.log('--- Starting Ratnakara Marine Backend Demo Integration Tests ---');
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

async function runDataModes() {
const base = BASE_URL;
const generated = ['ocean', 'ocean/kpis', 'fisheries', 'edna', 'taxonomy/tree', 'correlation', 'forecast', 'geo/stations', 'insights/generate', 'biodiversity/kpis', 'biodiversity/anomalies', 'alerts/active', 'gis/layers', 'vessels/tracking', 'sensors/live', 'satellite/pfz', 'satellite/hab', 'explorer/query'];
let checks = 0;
for (const path of generated) {
  const response = await fetch(`${base}/api/${path}`);
  const body = await response.json() as any;
  assert.equal(response.status, 503, path);
  assert.equal(body.dataMode, 'file-backed', path);
  assert.equal(body.data, null, path);
  checks++;
  const demoResponse = await fetch(`${base}/api/${path}?mode=demo`);
  const demo = await demoResponse.json() as any;
  assert.equal(demoResponse.status, 200, path);
  assert.equal(demo.dataMode, 'demo', path);
  assert.equal(demo.provenance.generated, true, path);
  checks++;
}
const raw = JSON.parse(fs.readFileSync('data/species_locations.json', 'utf8'));
const response = await fetch(`${base}/api/species-locations`);
const file = await response.json() as any;
assert.equal(response.status, 200);
assert.deepEqual(file.data, raw);
assert.equal(file.dataMode, 'file-backed');
assert.equal(file.provenance.generated, false);
checks++;
const headerDemo = await (await fetch(`${base}/api/ocean`, { headers: { 'X-Marine-Mode': 'demo' } })).json() as any;
assert.equal(headerDemo.dataMode, 'demo'); checks++;
for (const suffix of ['', '?mode=demo']) {
  const exportResponse = await fetch(`${base}/api/biodiversity/export/darwin-core${suffix}`);
  assert.ok([422, 503].includes(exportResponse.status)); checks++;
}
// A demo call must not change the next caller's default.
assert.equal((await fetch(`${base}/api/ocean`)).status, 503); checks++;
console.log(`${checks} data-mode checks passed`);

}

await runDataModes();
await runTests();
