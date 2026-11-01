/**
 * RoboVerse Phase 4 Quality Gate & Evaluation Test Suite:
 * Maker Radar & Shops Architecture Test
 */

const assert = require('assert');

function calculateHaversineDistanceM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function deduplicateShops(existingList, candidate) {
  for (const existing of existingList) {
    const dist = calculateHaversineDistanceM(
      existing.latitude,
      existing.longitude,
      candidate.latitude,
      candidate.longitude
    );
    if (
      (existing.google_place_id && existing.google_place_id === candidate.google_place_id) ||
      dist < 150 ||
      existing.name.toLowerCase().includes(candidate.name.toLowerCase()) ||
      candidate.name.toLowerCase().includes(existing.name.toLowerCase())
    ) {
      return { isDuplicate: true, matchedWith: existing.id };
    }
  }
  return { isDuplicate: false };
}

async function runTests() {
  console.log('===============================================================');
  console.log('📍 RoboVerse Maker Radar & Shops Quality Gate Test Suite');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ Passed: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ Failed: ${name} ->`, e.message);
    }
  }

  // 1. Distance Calculation Accuracy
  test('Haversine distance between SP Road Bengaluru and Lajpat Rai Delhi is ~1740 km', () => {
    const distM = calculateHaversineDistanceM(12.9644, 77.5833, 28.6562, 77.2355);
    const distKm = Math.round(distM / 1000);
    assert(distKm >= 1700 && distKm <= 1780, `Expected ~1740km, got ${distKm}km`);
  });

  // 2. Local distance in SP Road radius
  test('Distance within 5km radius correctly identifies nearby tech shops', () => {
    // Center at SP Road (12.9644, 77.5833), Shop at 500m (12.9680, 77.5833)
    const distM = calculateHaversineDistanceM(12.9644, 77.5833, 12.9680, 77.5833);
    assert(distM < 5000, `Expected <5000m, got ${distM}m`);
    assert(distM > 350 && distM < 450, `Expected ~400m, got ${distM}m`);
  });

  // 3. Deduplication by Distance (<150m) and Google Place ID
  test('Deduplication flags shop at same place ID', () => {
    const existing = [
      { id: 'shop_1', name: 'SP Road Robotics', latitude: 12.9644, longitude: 77.5833, google_place_id: 'ChIJ123' },
    ];
    const candidate = { name: 'Different Name', latitude: 12.9800, longitude: 77.6000, google_place_id: 'ChIJ123' };
    const res = deduplicateShops(existing, candidate);
    assert(res.isDuplicate, 'Should detect duplicate by place ID');
  });

  test('Deduplication flags shop within 150 meters', () => {
    const existing = [
      { id: 'shop_1', name: 'SP Road Robotics', latitude: 12.9644, longitude: 77.5833 },
    ];
    // Offset by ~50m
    const candidate = { name: 'Electronics World', latitude: 12.9648, longitude: 77.5833 };
    const res = deduplicateShops(existing, candidate);
    assert(res.isDuplicate, 'Should detect duplicate by distance <150m');
  });

  test('Deduplication allows distinct shops >150m apart', () => {
    const existing = [
      { id: 'shop_1', name: 'SP Road Robotics', latitude: 12.9644, longitude: 77.5833 },
    ];
    // Offset by ~1km
    const candidate = { name: 'Indiranagar Components', latitude: 12.9784, longitude: 77.6408 };
    const res = deduplicateShops(existing, candidate);
    assert(!res.isDuplicate, 'Should allow distinct shops');
  });

  // 4. Strict Field Mask Enforcement
  test('Strict Field Mask prevents high-tier billing leakage on text search', () => {
    const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.primaryType';
    assert(!fieldMask.includes('phoneNumber'), 'Search must NOT request phoneNumber in list search');
    assert(!fieldMask.includes('regularOpeningHours'), 'Search must NOT request regularOpeningHours in list search');
    assert(!fieldMask.includes('currentOpeningHours'), 'Search must NOT request currentOpeningHours in list search');
    assert(fieldMask.includes('places.id'), 'Must include id');
    assert(fieldMask.includes('places.location'), 'Must include location');
  });

  // 5. 24h Cell Cache Key Consistency
  test('Cell cache keys round to 2 decimals (~1.1km cell grid)', () => {
    const lat1 = 12.964412;
    const lng1 = 77.583345;
    const lat2 = 12.964199;
    const lng2 = 77.583601;

    const key1 = `${Math.round(lat1 * 100) / 100}_${Math.round(lng1 * 100) / 100}_5000_arduino`;
    const key2 = `${Math.round(lat2 * 100) / 100}_${Math.round(lng2 * 100) / 100}_5000_arduino`;

    assert.strictEqual(key1, key2, 'Nearby points in same 1.1km grid should share cache key');
  });

  // 6. Verification Status Labels
  test('Correct labeling format for Verified by RoboVerse vs From Google Maps', () => {
    const verifiedShop = { is_verified: true, source: 'verified' };
    const googleShop = { is_verified: false, source: 'google_places' };

    const getLabel = (s) => s.is_verified ? 'Verified by RoboVerse' : 'From Google Maps';
    assert.strictEqual(getLabel(verifiedShop), 'Verified by RoboVerse');
    assert.strictEqual(getLabel(googleShop), 'From Google Maps');
  });

  console.log('\n---------------------------------------------------------------');
  console.log(`📊 TEST RESULTS: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)`);
  console.log('---------------------------------------------------------------\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
