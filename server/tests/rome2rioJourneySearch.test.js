import assert from 'assert';
import { computeMultimodalRoutes } from '../services/multimodalRouteService.js';
import { findTransportHubs } from '../../client/src/data/transportHubsData.js';

console.log('🧪 Running Rome2Rio Journey Search & Multimodal Engine Tests...\n');

let total = 0;
let passed = 0;

function test(description, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ ${description}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    ${err.message}`);
  }
}

// 1. Journey Search: Multimodal Alternative Generation
test('computes comprehensive transport options between Delhi and Manali', () => {
  const result = computeMultimodalRoutes('Delhi', 'Manali', 2, 4, '2026-11-15');
  assert.ok(result.allRoutes.length >= 4, 'Should return at least 4 route alternatives');
  assert.ok(result.distanceKm > 400 && result.distanceKm < 650, 'Distance should be accurate (~535 km)');

  const modes = result.allRoutes.map((r) => r.mode);
  assert.ok(modes.includes('BUS'), 'Must include direct bus');
  assert.ok(modes.includes('MIXED'), 'Must include mixed multi-leg route (Train + Bus)');
  assert.ok(modes.includes('CAB') || modes.includes('CAR'), 'Must include road option');
});

// 2. Ordered Segment Breakdown
test('each route alternative contains ordered, structured journey segments', () => {
  const result = computeMultimodalRoutes('Delhi', 'Manali', 2, 4, '2026-11-15');
  const mixedRoute = result.allRoutes.find((r) => r.mode === 'MIXED');
  assert.ok(mixedRoute, 'Mixed route should be available');
  assert.ok(Array.isArray(mixedRoute.segments), 'Must contain segments array');
  assert.strictEqual(mixedRoute.segments.length, 2, 'Should have 2 segments (Train + Bus)');

  const seg1 = mixedRoute.segments[0];
  assert.strictEqual(seg1.mode, 'TRAIN');
  assert.ok(seg1.name.includes('Train'));
  assert.ok(seg1.serviceNumber, 'Should specify train service');
  assert.ok(seg1.intermediateStops.length > 0, 'Should include intermediate stops');
  assert.ok(seg1.fareEstimate.min > 0, 'Should have valid fare estimate');
  assert.ok(seg1.transferWaitMinutes > 0, 'Should indicate transfer connection time');

  const seg2 = mixedRoute.segments[1];
  assert.strictEqual(seg2.mode, 'BUS');
  assert.ok(seg2.bookingUrl.includes('redbus.in'), 'Segment should have direct redBus booking link');
});

// 3. Sorting Alternatives (Cheapest vs Fastest vs Best)
test('sorts routes correctly by Cheapest, Fastest, and Best Value', () => {
  const result = computeMultimodalRoutes('Delhi', 'Manali', 2, 4, '2026-11-15');
  assert.ok(result.cheapest, 'Cheapest route must be identified');
  assert.ok(result.fastest, 'Fastest route must be identified');
  assert.ok(result.bestBalanced, 'Best balanced route must be identified');

  assert.ok(result.cheapest.totalCost <= result.fastest.totalCost, 'Cheapest total cost <= fastest total cost');
  assert.ok(result.fastest.durationHours <= result.cheapest.durationHours, 'Fastest duration <= cheapest duration');
});

// 4. Filtering Alternatives by Mode and Direct Status
test('supports filtering routes by mode and direct status', () => {
  const result = computeMultimodalRoutes('Delhi', 'Manali', 2, 4, '2026-11-15');
  const busOnly = result.allRoutes.filter((r) => r.mode === 'BUS');
  assert.ok(busOnly.length >= 1, 'Should filter bus routes');

  const directOnly = result.allRoutes.filter((r) => r.transfersCount === 0);
  assert.ok(directOnly.length >= 2, 'Should have direct options (Bus, Drive, Cab)');
  directOnly.forEach((r) => {
    assert.strictEqual(r.transfersCount, 0, 'Direct routes must have 0 transfers');
  });
});

// 5. Coastal Ferry Integration
test('generates coastal ferry and transfer route between Mumbai and Alibaug', () => {
  const result = computeMultimodalRoutes('Mumbai', 'Alibaug', 2, 2, '2026-11-15');
  const ferryRoute = result.allRoutes.find((r) => r.mode === 'FERRY');
  assert.ok(ferryRoute, 'Must generate ferry option for Mumbai to Alibaug');
  assert.ok(ferryRoute.title.includes('Ferry'), 'Title must mention Ferry');
  assert.strictEqual(ferryRoute.segments[0].mode, 'FERRY');
  assert.ok(ferryRoute.segments[0].carrier.includes('M2M') || ferryRoute.segments[0].carrier.includes('Catamaran'));
});

// 6. Price Classification Integrity
test('correctly classifies price transparency tags (no fake live claims)', () => {
  const result = computeMultimodalRoutes('Delhi', 'Goa', 2, 5, '2026-12-01');
  const validClassifications = ['LIVE_OFFER', 'CALCULATED_ESTIMATE', 'INDICATIVE_ESTIMATE', 'UNAVAILABLE'];

  result.allRoutes.forEach((route) => {
    assert.ok(
      validClassifications.includes(route.priceClassification),
      `Route ${route.id} must have a valid priceClassification`
    );
    assert.ok(route.dataSource, `Route ${route.id} must explicitly declare its data source`);
  });
});

// 7. Transport Hubs Autocomplete Discovery
test('discovers structured airports, stations, and bus terminals', () => {
  const airportResults = findTransportHubs('DEL', 3);
  assert.ok(airportResults.length > 0, 'Should find DEL airport');
  assert.strictEqual(airportResults[0].code, 'DEL');
  assert.strictEqual(airportResults[0].type, 'Airport');
  assert.ok(Number.isFinite(airportResults[0].lat));

  const railResults = findTransportHubs('NDLS', 3);
  assert.ok(railResults.length > 0, 'Should find NDLS station');
  assert.strictEqual(railResults[0].type, 'Railway Station');
});

// 8. Location Swap Symmetry
test('location swap generates appropriate reverse journey options', () => {
  const forward = computeMultimodalRoutes('Delhi', 'Jaipur', 2, 3, '2026-11-15');
  const reverse = computeMultimodalRoutes('Jaipur', 'Delhi', 2, 3, '2026-11-15');

  assert.strictEqual(forward.distanceKm, reverse.distanceKm, 'Distance must match in reverse');
  assert.ok(forward.allRoutes.length > 0 && reverse.allRoutes.length > 0);
});

console.log(`\n========================================`);
console.log(`Rome2Rio Search Tests: ${passed}/${total} passed`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}
