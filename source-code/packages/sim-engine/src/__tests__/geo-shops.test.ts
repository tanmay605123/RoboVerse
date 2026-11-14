import { describe, it } from 'node:test';
import assert from 'node:assert';

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

describe('RoboVerse Geo & Spatial Retail Directory', () => {
  it('should accurately calculate distance between Delhi hubs using spherical geometry', () => {
    // Connaught Place (28.6315, 77.2167) to Chandni Chowk Lajpat Rai Market (28.6562, 77.2355)
    const dist = haversineDistanceKm(28.6315, 77.2167, 28.6562, 77.2355);
    assert.ok(dist >= 3.0 && dist <= 3.8, `Distance should be approximately 3.3km (calculated: ${dist.toFixed(2)}km)`);
  });

  it('should filter shops within a given radius and sort by nearest first', () => {
    const userLat = 28.6315;
    const userLng = 77.2167;

    const testShops = [
      { name: 'Nehru Place Store', lat: 28.5494, lng: 77.2522, dist: 0 },
      { name: 'Chandni Chowk Store', lat: 28.6562, lng: 77.2355, dist: 0 },
      { name: 'Bengaluru SP Road Store', lat: 12.9644, lng: 77.5833, dist: 0 },
    ];

    testShops.forEach((s) => {
      s.dist = haversineDistanceKm(userLat, userLng, s.lat, s.lng);
    });

    const radiusKm = 25;
    const withinRadius = testShops.filter((s) => s.dist <= radiusKm);
    withinRadius.sort((a, b) => a.dist - b.dist);

    assert.strictEqual(withinRadius.length, 2, 'Only 2 Delhi shops should be within 25km radius of Connaught Place');
    assert.strictEqual(withinRadius[0].name, 'Chandni Chowk Store', 'Nearest shop should be Chandni Chowk (~3.3km)');
    assert.strictEqual(withinRadius[1].name, 'Nehru Place Store', 'Second nearest shop should be Nehru Place (~9.7km)');
  });

  it('should filter shops by stocked component categories', () => {
    const shops = [
      { id: 's1', name: 'ElectroHub', categories: ['Arduino', 'Sensors', 'Kits'] },
      { id: 's2', name: 'Nehru Place Maker', categories: ['ESP32', '3D Printing'] },
      { id: 's3', name: 'RoboSpares', categories: ['Arduino', 'Servos', 'Motors'] },
    ];

    const searchComp = 'Arduino';
    const matches = shops.filter((s) => s.categories.some((c) => c.toLowerCase().includes(searchComp.toLowerCase())));

    assert.strictEqual(matches.length, 2, 'Should match 2 shops stocking Arduino');
    assert.ok(matches.some((m) => m.id === 's1'));
    assert.ok(matches.some((m) => m.id === 's3'));
  });
});
