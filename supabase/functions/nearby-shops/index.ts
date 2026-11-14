import { corsHeaders } from '../_shared/cors.ts';

interface RequestParams {
  lat: number;
  lng: number;
  radius_m?: number;
  query?: string;
  category?: string;
  open_now?: boolean;
}

interface MergedShop {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  distance_meters: number;
  distance_km: number;
  travel_time_mins: number;
  opening_hours: string;
  categories: string[];
  is_verified: boolean;
  verified_status: 'verified' | 'pending' | 'rejected' | 'google_places';
  rating: number;
  review_count: number;
  google_maps_uri?: string;
  google_place_id?: string;
  photos: string[];
  stocked_components: string[];
  source: 'verified' | 'google_places';
}

function calculateHaversineDistanceM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of Earth in meters
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

// 24-hour in-memory cell cache
const cellCache = new Map<string, { places: any[]; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let params: RequestParams;
    if (req.method === 'POST') {
      params = await req.json();
    } else {
      const url = new URL(req.url);
      params = {
        lat: parseFloat(url.searchParams.get('lat') || '28.6315'),
        lng: parseFloat(url.searchParams.get('lng') || '77.2167'),
        radius_m: parseInt(url.searchParams.get('radius_m') || '5000', 10),
        query: url.searchParams.get('query') || undefined,
        category: url.searchParams.get('category') || undefined,
        open_now: url.searchParams.get('open_now') === 'true',
      };
    }

    const { lat, lng, radius_m = 5000, query } = params;

    if (isNaN(lat) || isNaN(lng)) {
      return new Response(
        JSON.stringify({ error: 'Valid latitude and longitude coordinates are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');

    let verifiedShops: any[] = [];

    // 1. Fetch verified shops from Supabase PostGIS RPC
    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import('npm:@supabase/supabase-js@2');
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase.rpc('nearby_shops', {
          lat,
          lng,
          radius_m,
          p_limit: 30,
        });

        if (!error && data) {
          verifiedShops = data;
        }
      } catch (dbErr) {
        console.warn('Database nearby_shops RPC query warning:', dbErr);
      }
    }

    const mergedShopsMap = new Map<string, MergedShop>();

    // Add verified shops into map
    for (const shop of verifiedShops) {
      const distM =
        shop.distance_meters ||
        calculateHaversineDistanceM(lat, lng, shop.latitude, shop.longitude);
      const distKm = Number((distM / 1000).toFixed(1));
      const travelMins = Math.max(3, Math.round((distKm / 20) * 60 + 2));

      mergedShopsMap.set(shop.id, {
        id: shop.id,
        name: shop.name,
        phone: shop.phone || '+91 98100 00000',
        address: shop.address,
        city: shop.city,
        state: shop.state || 'India',
        pincode: shop.pincode || '',
        latitude: shop.latitude,
        longitude: shop.longitude,
        distance_meters: distM,
        distance_km: distKm,
        travel_time_mins: travelMins,
        opening_hours: shop.opening_hours || '10:00 AM - 8:00 PM (Mon-Sat)',
        categories: shop.categories || ['Arduino', 'Sensors', 'Electronics'],
        is_verified: true,
        verified_status: 'verified',
        rating: shop.rating || 4.8,
        review_count: 32,
        google_maps_uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          shop.name + ' ' + shop.city
        )}`,
        photos: shop.photos || [],
        stocked_components: [
          'Arduino Uno',
          'ESP32',
          'HC-SR04 Ultrasonic',
          'L298N Motor Driver',
          'SG90 Servo',
          'Breadboard & Jumpers',
          'Resistors & Capacitors',
        ],
        source: 'verified',
      });
    }

    // 2. Fetch Google Places API (New) Text Search with STRICT field mask & cell cache
    const googleApiKey =
      Deno.env.get('GOOGLE_PLACES_SERVER_KEY') || Deno.env.get('GOOGLE_MAPS_SERVER_KEY');

    if (googleApiKey) {
      try {
        const cellLat = Math.round(lat * 100) / 100;
        const cellLng = Math.round(lng * 100) / 100;
        const cacheKey = `${cellLat}_${cellLng}_${radius_m}_${(query || '').toLowerCase().trim()}`;

        let places: any[] = [];
        const cached = cellCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
          places = cached.places;
        } else {
          const textQuery = query
            ? `${query} electronic components shop OR robotics parts OR स्पेयर पार्ट्स`
            : 'electronic components shop OR arduino OR robotics kit OR electronics spare parts OR रोबोटिक्स';

          const placesResponse = await fetch(
            'https://places.googleapis.com/v1/places:searchText',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': googleApiKey,
                // STRICT FIELD MASK: Highest priced field sets pricing tier. Phone/hours fetched on demand.
                'X-Goog-FieldMask':
                  'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.primaryType',
              },
              body: JSON.stringify({
                textQuery,
                locationBias: {
                  circle: {
                    center: { latitude: lat, longitude: lng },
                    radius: radius_m,
                  },
                },
                languageCode: 'en',
                regionCode: 'IN',
                maxResultCount: 15,
              }),
            }
          );

          if (placesResponse.ok) {
            const placesData = await placesResponse.json();
            places = placesData.places || [];
            cellCache.set(cacheKey, { places, timestamp: Date.now() });
          }
        }

        for (const place of places) {
          const pLat = place.location?.latitude;
          const pLng = place.location?.longitude;
          if (!pLat || !pLng) continue;

          const placeId = place.id;
          const placeName = place.displayName?.text || 'Electronics Shop';

          // Check if already merged by name or distance < 150m or place_id
          let isDuplicate = false;
          for (const [, existing] of mergedShopsMap) {
            const distBetween = calculateHaversineDistanceM(
              existing.latitude,
              existing.longitude,
              pLat,
              pLng
            );
            if (
              existing.google_place_id === placeId ||
              distBetween < 150 ||
              existing.name.toLowerCase().includes(placeName.toLowerCase()) ||
              placeName.toLowerCase().includes(existing.name.toLowerCase())
            ) {
              isDuplicate = true;
              if (!existing.google_place_id) existing.google_place_id = placeId;
              if (!existing.google_maps_uri && place.googleMapsUri) {
                existing.google_maps_uri = place.googleMapsUri;
              }
              break;
            }
          }

          if (!isDuplicate) {
            const distM = calculateHaversineDistanceM(lat, lng, pLat, pLng);
            const distKm = Number((distM / 1000).toFixed(1));
            const travelMins = Math.max(3, Math.round((distKm / 20) * 60 + 2));

            mergedShopsMap.set(placeId, {
              id: placeId,
              name: placeName,
              phone: 'Tap to view hours & contact',
              address: place.formattedAddress || 'Local Electronics Market',
              city: 'Nearby',
              state: 'India',
              pincode: '',
              latitude: pLat,
              longitude: pLng,
              distance_meters: distM,
              distance_km: distKm,
              travel_time_mins: travelMins,
              opening_hours: '10:00 AM - 8:00 PM (Mon-Sat)',
              categories: ['General Electronics', 'Components'],
              is_verified: false,
              verified_status: 'google_places',
              rating: place.rating || 4.2,
              review_count: place.userRatingCount || 10,
              google_maps_uri:
                place.googleMapsUri ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  placeName
                )}`,
              google_place_id: placeId,
              photos: [],
              stocked_components: ['General Electronics', 'Wires', 'Components'],
              source: 'google_places',
            });
          }
        }
      } catch (placesErr) {
        console.warn('Google Places API fetch error, fallback to verified registry:', placesErr);
      }
    }

    const shopsList = Array.from(mergedShopsMap.values()).sort(
      (a, b) => a.distance_meters - b.distance_meters
    );

    return new Response(
      JSON.stringify({
        shops: shopsList,
        total: shopsList.length,
        center: { lat, lng },
        radius_m,
        hasServerKey: Boolean(googleApiKey),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Error searching nearby shops' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
