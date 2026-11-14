import { NextRequest, NextResponse } from 'next/server';

interface SeedShop {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  hours: string;
  categories: string[];
  isVerified: boolean;
  rating: number;
}

const SEED_SHOPS: SeedShop[] = [
  {
    id: 'shop_delhi_1',
    name: 'ElectroHub Components & Robotics',
    phone: '+91-11-23861234',
    address: 'Shop 42, Ground Floor, Lajpat Rai Market, Chandni Chowk',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110006',
    lat: 28.6562,
    lng: 77.2355,
    hours: '10:00 AM - 8:00 PM (Mon-Sat)',
    categories: ['Arduino', 'Microcontrollers', 'Sensors', 'Robotics Kits', 'LEDs & Passives'],
    isVerified: true,
    rating: 4.8,
  },
  {
    id: 'shop_delhi_2',
    name: 'Nehru Place Maker Supplies',
    phone: '+91-11-41609876',
    address: 'Building 14, 2nd Floor, Nehru Place Market',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110019',
    lat: 28.5494,
    lng: 77.2522,
    hours: '10:30 AM - 8:30 PM (Mon-Sat)',
    categories: ['Arduino', 'ESP32', 'Wires & Tools', '3D Printing', 'L298N Drivers'],
    isVerified: true,
    rating: 4.6,
  },
  {
    id: 'shop_delhi_3',
    name: 'Palam Electronics & Hobby Store',
    phone: '+91-11-25364411',
    address: 'Shop 12, Main Market, Sector 7, Dwarka',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110075',
    lat: 28.5823,
    lng: 77.0700,
    hours: '10:00 AM - 7:30 PM (Daily)',
    categories: ['Arduino', 'Batteries', 'Sensors', 'Soldering Guns'],
    isVerified: true,
    rating: 4.5,
  },
  {
    id: 'shop_blr_1',
    name: 'RoboSpares Lab & Kits',
    phone: '+91-80-22234567',
    address: '24/1 Sadar Patrappa Road (SP Road), Nagarathpete',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560002',
    lat: 12.9644,
    lng: 77.5833,
    hours: '10:00 AM - 9:00 PM (Mon-Sat)',
    categories: ['Arduino', 'Raspberry Pi', 'Motors', 'Servos', 'LiPo Batteries', 'Sensors'],
    isVerified: true,
    rating: 4.9,
  },
  {
    id: 'shop_mum_1',
    name: 'Lamington Maker Space & Components',
    phone: '+91-22-23876543',
    address: '102 Jagmohan Mansion, Lamington Road, Grant Road East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400007',
    lat: 18.9616,
    lng: 72.8164,
    hours: '10:30 AM - 8:00 PM (Mon-Sat)',
    categories: ['Arduino', 'ESP32', 'Motors', 'Sensors', 'Tools', 'Multimeters'],
    isVerified: true,
    rating: 4.7,
  },
  {
    id: 'shop_pune_1',
    name: 'Pune RoboZone & Electronics',
    phone: '+91-20-24451234',
    address: 'Shop 18, Pasodya Vithoba Temple Lane, Budhwar Peth',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411002',
    lat: 18.5186,
    lng: 73.8553,
    hours: '10:00 AM - 8:00 PM (Mon-Sat)',
    categories: ['Arduino', 'Chassis', 'Wheels', 'Batteries', 'Sensors'],
    isVerified: true,
    rating: 4.6,
  },
  {
    id: 'shop_hyd_1',
    name: 'Hyderabad Maker Hub',
    phone: '+91-40-24758899',
    address: 'Shop 8, Bank Street, Gujarati Galli, Koti',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500095',
    lat: 17.3850,
    lng: 78.4867,
    hours: '10:30 AM - 8:30 PM (Mon-Sat)',
    categories: ['Arduino', 'Microcontrollers', 'Motors', 'Sensors', 'Breadboards'],
    isVerified: true,
    rating: 4.7,
  },
];

// Haversine formula to compute distance in km
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

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get('lat') || '28.6315');
    const lng = parseFloat(url.searchParams.get('lng') || '77.2167');
    const radiusKm = parseFloat(url.searchParams.get('radiusKm') || url.searchParams.get('radius_m') ? (parseFloat(url.searchParams.get('radius_m') || '25000') / 1000).toString() : '50');
    const component = (url.searchParams.get('component') || url.searchParams.get('category') || '').toLowerCase().trim();

    // Compute distances
    const enriched = SEED_SHOPS.map((shop) => {
      const dist = haversineDistanceKm(lat, lng, shop.lat, shop.lng);
      return {
        ...shop,
        distanceKm: Number(dist.toFixed(1)),
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${shop.name}, ${shop.address}, ${shop.city}`)}`,
        stockedComponents: shop.categories,
        openingHours: shop.hours,
      };
    });

    // Filter by radius and component
    let filtered = enriched.filter((shop) => shop.distanceKm <= radiusKm);

    if (component) {
      filtered = filtered.filter(
        (shop) =>
          shop.name.toLowerCase().includes(component) ||
          shop.categories.some((c) => c.toLowerCase().includes(component))
      );
    }

    // Sort by distance ascending
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);

    // If none within radius, return nearest 3 shops anyway so the student always sees closest hubs
    if (filtered.length === 0) {
      filtered = enriched.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);
    }

    return NextResponse.json({
      success: true,
      data: {
        center: { lat, lng },
        radiusKm,
        totalFound: filtered.length,
        shops: filtered,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Failed to fetch nearby shops' } },
      { status: 500 }
    );
  }
}
