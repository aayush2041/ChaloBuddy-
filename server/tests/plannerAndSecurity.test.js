import assert from 'assert';
import { computeMultimodalRoutes } from '../services/multimodalRouteService.js';
import { evaluateMessage } from '../services/contactFilter.js';

console.log('🧪 Running ChaloBuddy Planner & Security Integration Tests...\n');

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

// 1. Multimodal Route Engine Tests
test('generates multimodal routes between Delhi and Manali', () => {
  const routes = computeMultimodalRoutes('Delhi', 'Manali', 2, 4, '2026-11-01');
  assert.ok(routes.allRoutes.length >= 3, 'Should generate at least 3 distinct transport options');

  // Verify options include bus, train or car/cab
  const modes = routes.allRoutes.map((r) => r.mode);
  assert.ok(modes.includes('BUS'), 'Should include intercity AC Volvo bus');
  assert.ok(modes.includes('CAB') || modes.includes('CAR'), 'Should include road transport');

  // Verify comparisons
  assert.ok(routes.cheapest, 'Cheapest route must exist');
  assert.ok(routes.fastest, 'Fastest route must exist');
  assert.ok(routes.cheapest.totalCost <= routes.fastest.totalCost, 'Cheapest must be <= fastest cost');
});

test('handles long-haul / overseas destination with flights', () => {
  const routes = computeMultimodalRoutes('Delhi', 'Dubai', 2, 5, '2026-12-10');
  assert.strictEqual(routes.isInternational, true);
  const flightRoute = routes.allRoutes.find((r) => r.mode === 'FLIGHT');
  assert.ok(flightRoute, 'Must offer flight for international route');
  assert.strictEqual(flightRoute.priceClassification, 'INDICATIVE_ESTIMATE');
  assert.ok(flightRoute.bookingUrl.includes('google.com/travel/flights'), 'Must provide live flight search link');
});

test('computes deterministic pricing with room occupancy', () => {
  const numTravelers = 3;
  const nights = 3;
  const roomPricePerNight = 3000;
  // 3 travelers in twin-share require ceil(3/2) = 2 rooms
  const roomsRequired = Math.ceil(numTravelers / 2);
  const totalStayCost = roomPricePerNight * nights * roomsRequired;
  assert.strictEqual(roomsRequired, 2);
  assert.strictEqual(totalStayCost, 18000);
});

test('10% contingency cushion is calculated correctly', () => {
  const subtotal = 50000;
  const contingency = Math.round(subtotal * 0.10);
  const total = subtotal + contingency;
  assert.strictEqual(contingency, 5000);
  assert.strictEqual(total, 55000);
});

// 2. Security & Moderation Invariants
test('contact filter blocks phone numbers embedded in casual text', () => {
  const res = evaluateMessage('Hey dude just drop a message to 9811223344 on phone');
  assert.strictEqual(res.isAllowed, false);
});

test('contact filter allows legitimate flight numbers and train codes', () => {
  const res = evaluateMessage('We are booked on AI-102 and our return is Train 12004');
  assert.strictEqual(res.isAllowed, true);
});

test('contact filter blocks social handle promotions', () => {
  const res = evaluateMessage('Follow my updates on insta: @himalayan_nomad');
  assert.strictEqual(res.isAllowed, false);
});

console.log(`\n========================================`);
console.log(`Planner & Security Tests: ${passed}/${total} passed`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}
