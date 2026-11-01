import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory cache for place details (24 hours TTL)
const detailsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get('place_id');

    if (!placeId) {
      return NextResponse.json({ error: 'place_id is required' }, { status: 400 });
    }

    // Check cache
    const cached = detailsCache.get(placeId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ ...cached.data, cached: true });
    }

    const apiKey =
      process.env.GOOGLE_PLACES_SERVER_KEY || process.env.GOOGLE_MAPS_SERVER_KEY;

    if (!apiKey) {
      return NextResponse.json({
        place_id: placeId,
        nationalPhoneNumber: null,
        regularOpeningHours: null,
        websiteUri: null,
        source: 'unavailable_without_key',
      });
    }

    // Fetch Google Places API (New) Place Details with STRICT field mask
    // Using only requested fields to minimize pricing tier
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,nationalPhoneNumber,regularOpeningHours,currentOpeningHours,websiteUri',
      },
    });

    if (!res.ok) {
      return NextResponse.json({
        place_id: placeId,
        phone: null,
        regularOpeningHours: null,
        status: res.status,
      });
    }

    const data = await res.json();
    const result = {
      place_id: data.id || placeId,
      phone: data.nationalPhoneNumber || null,
      openingHours: data.regularOpeningHours?.weekdayDescriptions || null,
      openNow: data.currentOpeningHours?.openNow ?? null,
      websiteUri: data.websiteUri || null,
    };

    detailsCache.set(placeId, { data: result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch place details' },
      { status: 500 }
    );
  }
}
