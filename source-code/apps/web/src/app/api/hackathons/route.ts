import { NextRequest, NextResponse } from 'next/server';
import { OFFICIAL_HACKATHONS } from '@roboverse/shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const mode = searchParams.get('mode');
    const search = searchParams.get('search')?.toLowerCase();

    let list = [...OFFICIAL_HACKATHONS];

    if (city && city !== 'ALL') {
      list = list.filter((h) => h.city.toLowerCase() === city.toLowerCase());
    }

    if (mode && mode !== 'ALL') {
      list = list.filter((h) => h.mode === mode);
    }

    if (search) {
      list = list.filter(
        (h) =>
          h.title.toLowerCase().includes(search) ||
          h.description.toLowerCase().includes(search) ||
          h.organizer.toLowerCase().includes(search) ||
          h.tracks.some((t) => t.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        hackathons: list,
        total: list.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_HACKATHONS_FAILED',
          message: err.message || 'Failed to retrieve hackathons.',
        },
      },
      { status: 500 }
    );
  }
}
