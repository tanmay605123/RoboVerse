import { NextRequest, NextResponse } from 'next/server';
import { OFFICIAL_STORE_CATALOG } from '@roboverse/shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();
    const sort = searchParams.get('sort');

    let filtered = [...OFFICIAL_STORE_CATALOG];

    // Filter by Category
    if (category && category !== 'ALL') {
      filtered = filtered.filter(
        (p) => p.category === category || p.categoryId === category
      );
    }

    // Filter by Search Query
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          (p.specs && Object.values(p.specs).some((v) => String(v).toLowerCase().includes(search)))
      );
    }

    // Sort
    if (sort === 'price_asc') {
      filtered.sort((a, b) => a.priceInr - b.priceInr);
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => b.priceInr - a.priceInr);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      // Popular / Featured: Kits first, then by rating
      filtered.sort((a, b) => {
        if (a.isKit && !b.isKit) return -1;
        if (!a.isKit && b.isKit) return 1;
        return b.rating - a.rating;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        products: filtered,
        total: filtered.length,
        categories: [
          { id: 'ALL', label: 'All Components' },
          { id: 'ROBOT_KITS', label: 'Robot Kits' },
          { id: 'MICROCONTROLLERS', label: 'Microcontrollers' },
          { id: 'ACTUATORS', label: 'Motors & Servos' },
          { id: 'SENSORS', label: 'Sensors' },
          { id: 'MECHANICAL', label: 'Chassis & Wheels' },
          { id: 'TOOLS', label: 'Tools & Soldering' },
        ],
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_PRODUCTS_FAILED',
          message: err.message || 'Failed to retrieve TechSavyyy store catalog.',
        },
      },
      { status: 500 }
    );
  }
}
