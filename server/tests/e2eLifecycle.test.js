import assert from 'assert';
import app from '../index.js';
import prisma from '../db.js';

console.log('🧪 Running ChaloBuddy End-to-End API & Security Lifecycle Tests...\n');

let server;
let baseUrl;
let total = 0;
let passed = 0;

function test(description, fn) {
  total++;
  return fn()
    .then(() => {
      passed++;
      console.log(`  ✓ ${description}`);
    })
    .catch((err) => {
      console.error(`  ✗ FAIL: ${description}`);
      console.error(`    ${err.message}`);
    });
}

async function runSuite() {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  const timestamp = Date.now();
  const testFemaleUser = {
    name: 'Sara Khan',
    email: `sara.${timestamp}@chalobuddy.com`,
    password: 'Password@123',
    gender: 'FEMALE',
  };
  const testMaleUser = {
    name: 'Dev Malik',
    email: `dev.${timestamp}@chalobuddy.com`,
    password: 'Password@123',
    gender: 'MALE',
  };

  let femaleToken = '';
  let femaleId = '';
  let maleToken = '';
  let maleId = '';
  let testTripId = '';
  let womenOnlyTripId = 'trip_women_gokarna';
  let conversationId = '';

  try {
    // 1. Health check
    await test('GET /api/health returns healthy status and DB connection', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.status, 'healthy');
      assert.strictEqual(data.database, 'connected');
    });

    // 2. Register Female Traveler
    await test('POST /api/auth/register registers a female traveler', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testFemaleUser),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(data.success, true);
      assert.ok(data.token);
      assert.strictEqual(data.user.gender, 'FEMALE');
      femaleToken = data.token;
      femaleId = data.user.id;
    });

    // 3. Register Male Traveler
    await test('POST /api/auth/register registers a male traveler', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testMaleUser),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.user.gender, 'MALE');
      maleToken = data.token;
      maleId = data.user.id;
    });

    // 4. Public Profile Privacy Protection
    await test('GET /api/auth/user/:id preserves traveler privacy (no email/phone exposed)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/user/${femaleId}`);
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.traveler.name, testFemaleUser.name);
      assert.strictEqual(data.traveler.email, undefined);
      assert.strictEqual(data.traveler.phone, undefined);
    });

    // 5. Host Creates a Public Trip
    await test('POST /api/trips creates and publishes a verified trip', async () => {
      const res = await fetch(`${baseUrl}/api/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${femaleToken}`,
        },
        body: JSON.stringify({
          title: 'Delhi to Kasol Pine Trails',
          startingLocation: 'Delhi, India',
          destination: 'Kasol, Himachal Pradesh',
          startDate: '2026-11-20',
          endDate: '2026-11-24',
          price: 6800,
          seats: 6,
          description: 'Hike through scenic Parvati valley and camp beside river trails.',
          transport: 'BUS',
          accommodation: 'HOMESTAY',
          travelStyle: 'ADVENTURE',
          isWomenOnly: false,
        }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(data.success, true);
      assert.ok(data.trip.id);
      testTripId = data.trip.id;
    });

    // 6. Host cannot join their own trip
    await test('POST /api/trips/:id/join-requests blocks host from requesting to join own trip', async () => {
      const res = await fetch(`${baseUrl}/api/trips/${testTripId}/join-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${femaleToken}`,
        },
        body: JSON.stringify({ message: 'Self join test' }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 400);
      assert.strictEqual(data.success, false);
      assert.ok(data.error.includes('host'));
    });

    // 7. Male Traveler requests to join the Public Trip
    await test('POST /api/trips/:id/join-requests submits valid traveler request', async () => {
      const res = await fetch(`${baseUrl}/api/trips/${testTripId}/join-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${maleToken}`,
        },
        body: JSON.stringify({ message: 'Excited to hike Kasol!' }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.request.status, 'PENDING');
    });

    // 8. Women-Only Trip Backend Enforcement: Male user blocked with 403
    await test('POST /api/trips/:id/join-requests blocks non-female traveler from Women-Only trip', async () => {
      const res = await fetch(`${baseUrl}/api/trips/${womenOnlyTripId}/join-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${maleToken}`,
        },
        body: JSON.stringify({ message: 'Can I join?' }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 403);
      assert.strictEqual(data.success, false);
      assert.ok(data.error.toLowerCase().includes('female'));
    });

    // 9. Women-Only Trip Backend Enforcement: Female user allowed to request
    await test('POST /api/trips/:id/join-requests allows female traveler for Women-Only trip', async () => {
      const res = await fetch(`${baseUrl}/api/trips/${womenOnlyTripId}/join-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${femaleToken}`,
        },
        body: JSON.stringify({ message: 'Looking forward to women-only coastal retreat!' }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(data.success, true);
    });

    // 10. Message Security: Contact Information Filter in Chat
    await test('POST /api/conversations/:id/messages blocks personal phone numbers', async () => {
      // Find the group conversation for testTripId
      const conv = await prisma.conversation.findFirst({
        where: { tripId: testTripId },
      });
      assert.ok(conv, 'Trip group conversation must exist');
      conversationId = conv.id;

      const res = await fetch(`${baseUrl}/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${femaleToken}`,
        },
        body: JSON.stringify({ text: 'Call me on 9876543210 for tickets' }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 400);
      assert.strictEqual(data.blocked, true);
      assert.strictEqual(data.violationType, 'PHONE_NUMBER_DETECTED');
    });

    // 11. Message Security: Allows legitimate travel communications
    await test('POST /api/conversations/:id/messages delivers legitimate travel discussion', async () => {
      const res = await fetch(`${baseUrl}/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${femaleToken}`,
        },
        body: JSON.stringify({ text: 'I booked the AC Volvo bus departing at 09:30 PM. Cost is ₹1,800.' }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(data.success, true);
      assert.ok(data.message.id);
    });

    // 12. Multimodal Planner Itinerary Generation & Budget Breakdown
    await test('POST /api/planner/generate produces day-by-day itinerary with budget integrity', async () => {
      const res = await fetch(`${baseUrl}/api/planner/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: 'Delhi',
          destination: 'Manali',
          startDate: '2026-11-01',
          endDate: '2026-11-05',
          travelers: 2,
          budgetBasis: 'TOTAL',
          budgetAmount: 30000,
        }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.itinerary.daysCount, 5);
      assert.strictEqual(data.itinerary.travelers, 2);
      assert.ok(data.itinerary.pricing.totalGroupCost > 0);
      assert.ok(data.itinerary.pricing.breakdown.length >= 6);
    });

    // 13. Save Itinerary to Persistent Database
    await test('POST /api/planner/saved-plans persists itinerary for authenticated user', async () => {
      const res = await fetch(`${baseUrl}/api/planner/saved-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${femaleToken}`,
        },
        body: JSON.stringify({
          title: 'Manali Mountain Expedition (Saved)',
          origin: 'Delhi',
          destination: 'Manali',
          startDate: '2026-11-01',
          endDate: '2026-11-05',
          travelers: 2,
          totalBudget: 28000,
        }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(data.success, true);
      assert.ok(data.savedPlan.id);
    });

    // 14. Retrieve Saved Itineraries
    await test('GET /api/planner/saved-plans returns user saved itineraries', async () => {
      const res = await fetch(`${baseUrl}/api/planner/saved-plans`, {
        headers: { Authorization: `Bearer ${femaleToken}` },
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.ok(data.plans.length >= 1);
    });

  } finally {
    // Cleanup created test records
    try {
      if (testTripId) {
        await prisma.tripRequest.deleteMany({ where: { tripId: testTripId } });
        await prisma.message.deleteMany({ where: { conversation: { tripId: testTripId } } });
        await prisma.conversationParticipant.deleteMany({ where: { conversation: { tripId: testTripId } } });
        await prisma.conversation.deleteMany({ where: { tripId: testTripId } });
        await prisma.trip.delete({ where: { id: testTripId } });
      }
      if (femaleId) {
        await prisma.tripRequest.deleteMany({ where: { requesterId: femaleId } });
        await prisma.savedPlan.deleteMany({ where: { userId: femaleId } });
        await prisma.profile.deleteMany({ where: { userId: femaleId } });
        await prisma.verification.deleteMany({ where: { userId: femaleId } });
        await prisma.notification.deleteMany({ where: { userId: femaleId } });
        await prisma.user.delete({ where: { id: femaleId } });
      }
      if (maleId) {
        await prisma.tripRequest.deleteMany({ where: { requesterId: maleId } });
        await prisma.profile.deleteMany({ where: { userId: maleId } });
        await prisma.verification.deleteMany({ where: { userId: maleId } });
        await prisma.notification.deleteMany({ where: { userId: maleId } });
        await prisma.user.delete({ where: { id: maleId } });
      }
    } catch (cleanupErr) {
      console.warn('Test cleanup warning:', cleanupErr.message);
    }

    if (server) server.close();
  }

  console.log(`\n========================================`);
  console.log(`End-to-End Suite: ${passed}/${total} passed`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
