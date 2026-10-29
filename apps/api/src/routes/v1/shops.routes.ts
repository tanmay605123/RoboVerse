import { Router, Request, Response } from 'express';
import { inMemoryDb } from '../../lib/db';

const router = Router();

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * @openapi
 * /api/v1/shops/nearby:
 *   get:
 *     summary: Find nearby electronic & robotics component shops
 *     tags: [Shops]
 */
router.get('/nearby', (req: Request, res: Response) => {
  const { lat, lng, radiusKm = 25, city, component } = req.query;

  const userLat = lat ? parseFloat(lat as string) : 28.6139; // Default to Delhi center
  const userLng = lng ? parseFloat(lng as string) : 77.2090;
  const maxRadius = parseFloat(radiusKm as string);

  let shops = Array.from(inMemoryDb.shops.values()).map((shop) => {
    const distanceKm = getDistanceFromLatLonInKm(userLat, userLng, shop.latitude, shop.longitude);
    return {
      ...shop,
      distanceKm,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`,
    };
  });

  if (city) {
    const cityStr = (city as string).toLowerCase();
    shops = shops.filter((s) => s.city.toLowerCase() === cityStr);
  }

  if (component) {
    const compStr = (component as string).toLowerCase();
    shops = shops.filter((s) =>
      s.stockedComponents?.some((c: string) => c.toLowerCase().includes(compStr))
    );
  }

  // Filter by radius if GPS provided
  if (lat && lng) {
    shops = shops.filter((s) => s.distanceKm <= maxRadius);
  }

  // Sort by nearest distance
  shops.sort((a, b) => a.distanceKm - b.distanceKm);

  return res.status(200).json({
    success: true,
    data: {
      userLocation: { latitude: userLat, longitude: userLng },
      radiusKm: maxRadius,
      count: shops.length,
      shops,
    },
  });
});

/**
 * Known Indian electronics market & tech hub coordinates fallback
 */
const KNOWN_MARKETS: Record<string, { lat: number; lng: number; city: string; state: string; name: string }> = {
  'delhi': { lat: 28.6315, lng: 77.2167, city: 'Delhi', state: 'Delhi', name: 'Connaught Place, New Delhi' },
  'chandni chowk': { lat: 28.6562, lng: 77.2355, city: 'Delhi', state: 'Delhi', name: 'Chandni Chowk / Lajpat Rai Market, Delhi' },
  'lajpat rai': { lat: 28.6562, lng: 77.2355, city: 'Delhi', state: 'Delhi', name: 'Lajpat Rai Market, Old Delhi' },
  'nehru place': { lat: 28.5494, lng: 77.2522, city: 'Delhi', state: 'Delhi', name: 'Nehru Place Hardware Hub, New Delhi' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, city: 'Bengaluru', state: 'Karnataka', name: 'Bengaluru Central' },
  'sp road': { lat: 12.9644, lng: 77.5833, city: 'Bengaluru', state: 'Karnataka', name: 'SP Road Electronics Market, Bengaluru' },
  'koramangala': { lat: 12.9352, lng: 77.6245, city: 'Bengaluru', state: 'Karnataka', name: 'Koramangala Maker Zone, Bengaluru' },
  'indiranagar': { lat: 12.9719, lng: 77.6412, city: 'Bengaluru', state: 'Karnataka', name: 'Indiranagar Tech Lane, Bengaluru' },
  'mumbai': { lat: 19.0760, lng: 72.8777, city: 'Mumbai', state: 'Maharashtra', name: 'Mumbai Central' },
  'lamington road': { lat: 18.9616, lng: 72.8164, city: 'Mumbai', state: 'Maharashtra', name: 'Lamington Road Electronics District, Mumbai' },
  'andheri': { lat: 19.1136, lng: 72.8697, city: 'Mumbai', state: 'Maharashtra', name: 'Andheri West Hardware Market, Mumbai' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', state: 'Telangana', name: 'Hyderabad Central' },
  'gujarati galli': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', state: 'Telangana', name: 'Gujarati Galli / Koti Electronics, Hyderabad' },
  'pune': { lat: 18.5204, lng: 73.8567, city: 'Pune', state: 'Maharashtra', name: 'Pune Central' },
  'budhwar peth': { lat: 18.5167, lng: 73.8562, city: 'Pune', state: 'Maharashtra', name: 'Budhwar Peth Component Lane, Pune' },
  'chennai': { lat: 13.0827, lng: 80.2707, city: 'Chennai', state: 'Tamil Nadu', name: 'Chennai Central' },
  'ritchie street': { lat: 13.0673, lng: 80.2727, city: 'Chennai', state: 'Tamil Nadu', name: 'Ritchie Street Electronics Market, Chennai' },
};

/**
 * @openapi
 * /api/v1/shops/geocode:
 *   get:
 *     summary: Resolve city or electronics market name to GPS coordinates via Google Maps Platform
 *     tags: [Shops]
 */
router.get('/geocode', async (req: Request, res: Response) => {
  const { query } = req.query;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_QUERY', message: 'Address query parameter is required' },
    });
  }

  const q = query.trim().toLowerCase();

  // 1. Check if Google Maps Server Key is available and not mock
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (apiKey && !apiKey.startsWith('mock_')) {
    try {
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      if (geoData.status === 'OK' && geoData.results?.[0]) {
        const result = geoData.results[0];
        const { lat, lng } = result.geometry.location;
        return res.status(200).json({
          success: true,
          data: {
            latitude: lat,
            longitude: lng,
            formattedAddress: result.formatted_address,
            placeId: result.place_id,
            source: 'GOOGLE_MAPS_API',
          },
        });
      }
    } catch {
      // Fallback to local dictionary
    }
  }

  // 2. Dictionary match for Indian electronics markets
  for (const [key, val] of Object.entries(KNOWN_MARKETS)) {
    if (q.includes(key) || key.includes(q)) {
      return res.status(200).json({
        success: true,
        data: {
          latitude: val.lat,
          longitude: val.lng,
          formattedAddress: val.name,
          city: val.city,
          state: val.state,
          source: 'ROBOVERSE_MARKET_REGISTRY',
        },
      });
    }
  }

  // Default fallback if unknown
  return res.status(200).json({
    success: true,
    data: {
      latitude: 28.6139,
      longitude: 77.2090,
      formattedAddress: `${query}, India`,
      city: 'Delhi',
      state: 'Delhi',
      source: 'DEFAULT_FALLBACK',
    },
  });
});

/**
 * @openapi
 * /api/v1/shops/{id}:
 *   get:
 *     summary: Get details of a specific component shop
 *     tags: [Shops]
 */
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const shop = inMemoryDb.shops.get(id);

  if (!shop) {
    return res.status(404).json({
      success: false,
      error: { code: 'SHOP_NOT_FOUND', message: 'Electronics shop not found' },
    });
  }

  return res.status(200).json({
    success: true,
    data: shop,
  });
});

export default router;
