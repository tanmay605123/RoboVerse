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
