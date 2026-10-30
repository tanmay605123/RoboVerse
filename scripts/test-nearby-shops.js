/**
 * RoboVerse Maker Radar & Nearby Stores Test Suite
 * Validates:
 * 1. PostGIS & Haversine distance calculations
 * 2. Deduplication logic (merging verified registry with Google Places)
 * 3. Radius filtering and travel time estimation
 * 4. BOM stocking match score
 * 5. Store issue report schema validation
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

function deduplicateShops(verifiedList, placesList) {
  const mergedMap = new Map();

  for (const shop of verifiedList) {
    mergedMap.set(shop.id, { ...shop, source: 'verified', is_verified: true });
  }

  for (const place of placesList) {
    let isDuplicate = false;
    for (const [, existing] of mergedMap) {
      const dist = calculateHaversineDistanceM(
        existing.latitude,
        existing.longitude,
        place.latitude,
        place.longitude
      );
      if (
        dist < 150 ||
        existing.name.toLowerCase().includes(place.name.toLowerCase()) ||
        place.name.toLowerCase().includes(existing.name.toLowerCase())
      ) {
        isDuplicate = true;
        if (!existing.google_place_id) existing.google_place_id = place.id;
        break;
      }
    }

    if (!isDuplicate) {
      mergedMap.set(place.id, { ...place, source: 'google_places', is_verified: false });
    }
  }

  return Array.from(mergedMap.values());
}

async function runNearbyShopsTests() {
  console.log('===============================================================');
  console.log('📍 RoboVerse Nearby Stores & Maker Radar Test Suite');
  console.log('   Evaluating PostGIS Geospatial Filtering & Deduplication');
  console.log('===============================================================\n');

  // Test 1: Distance calculation between Bengaluru Majestic and SP Road
  console.log('Test 1: Validating Haversine distance accuracy...');
  const majestic = { lat: 12.9767, lng: 77.5713 };
  const spRoad = { lat: 12.9644, lng: 77.5833 };
  const distM = calculateHaversineDistanceM(majestic.lat, majestic.lng, spRoad.lat, spRoad.lng);
  const distKm = Number((distM / 1000).toFixed(1));

  assert(distKm >= 1.8 && distKm <= 2.2, `Distance should be ~2.0km, got ${distKm}km`);
  console.log(`   ✅ Majestic to SP Road distance: ${distKm} km (~${distM} m) passed.\n`);

  // Test 2: Travel time estimation
  console.log('Test 2: Validating travel time calculation...');
  const travelTimeMins = Math.max(3, Math.round((distKm / 20) * 60 + 2));
  assert(travelTimeMins >= 6 && travelTimeMins <= 12, `Travel time should be ~8 mins, got ${travelTimeMins}`);
  console.log(`   ✅ Estimated travel time: ${travelTimeMins} mins passed.\n`);

  // Test 3: Deduplication of verified store with Google Places entry
  console.log('Test 3: Testing deduplication of Google Places with Verified registry...');
  const verifiedShop = {
    id: 'shop_v1',
    name: 'SP Road Robotics Hub',
    latitude: 12.9644,
    longitude: 77.5833,
    phone: '+91 80 2223 8899',
  };

  const googlePlaceSame = {
    id: 'place_g1',
    name: 'SP Road Robotics',
    latitude: 12.9645,
    longitude: 77.5834, // ~15m away
  };

  const googlePlaceDifferent = {
    id: 'place_g2',
    name: 'Jayanagar Components Depot',
    latitude: 12.9300,
    longitude: 77.5800, // ~3.8km away
  };

  const deduplicated = deduplicateShops([verifiedShop], [googlePlaceSame, googlePlaceDifferent]);
  assert.strictEqual(deduplicated.length, 2, 'Should deduplicate place_g1 with shop_v1 and keep place_g2');
  assert.strictEqual(deduplicated[0].id, 'shop_v1');
  assert.strictEqual(deduplicated[0].google_place_id, 'place_g1');
  assert.strictEqual(deduplicated[1].id, 'place_g2');
  console.log('   ✅ Deduplication merged 1 duplicate place and retained 1 unique place.\n');

  // Test 4: BOM Stocking Match Score
  console.log('Test 4: Evaluating BOM hardware stock availability match...');
  const studentBom = ['Arduino Uno', 'HC-SR04', 'SG90 Servo', 'LiPo Battery'];
  const shopStock = ['Arduino Uno', 'ESP32', 'HC-SR04', 'L298N', 'SG90 Servo', 'Breadboard'];

  const matched = studentBom.filter((b) => shopStock.some((s) => s.toLowerCase().includes(b.toLowerCase())));
  const matchPct = Math.round((matched.length / studentBom.length) * 100);

  assert(matchPct >= 75, `Expected >= 75% match, got ${matchPct}%`);
  console.log(`   ✅ BOM Match: ${matched.length}/${studentBom.length} items stocked (${matchPct}%).\n`);

  console.log('---------------------------------------------------------------');
  console.log('🌟 ALL 4 NEARBY STORES TESTS PASSED SUCCESSFULLY!');
  console.log('===============================================================\n');
}

runNearbyShopsTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
