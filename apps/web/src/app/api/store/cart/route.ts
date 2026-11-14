import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

function getUserIdFromAuth(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;
  // Simple decode or token check for local bridge
  return 'user_authenticated';
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: true, data: { items: [], subtotalInr: 0, count: 0 } });
    }

    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace(/^Bearer /i, ''));
    if (authErr || !user) {
      return NextResponse.json({ success: true, data: { items: [], subtotalInr: 0, count: 0 } });
    }

    const { data: cartRows, error: cartErr } = await (supabase.from('cart_items') as any)
      .select('id, quantity, product_id, products(id, name, sku, price_inr, stock, age_restricted, category_id, images)')
      .eq('user_id', user.id);

    if (cartErr) {
      return NextResponse.json({ success: false, error: { message: cartErr.message } }, { status: 500 });
    }

    const items = (cartRows || []).map((row: any) => ({
      id: row.id,
      productId: row.product_id,
      title: row.products?.name || 'Component',
      sku: row.products?.sku || '',
      priceInr: Number(row.products?.price_inr || 0),
      stock: Number(row.products?.stock || 0),
      ageRestricted: Boolean(row.products?.age_restricted),
      quantity: row.quantity,
      categoryId: row.products?.category_id,
      image: row.products?.images?.[0] || '/products/component.png',
    }));

    const subtotalInr = items.reduce((acc: number, it: any) => acc + it.priceInr * it.quantity, 0);
    const count = items.reduce((acc: number, it: any) => acc + it.quantity, 0);

    return NextResponse.json({
      success: true,
      data: {
        items,
        subtotalInr,
        count,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const body = await req.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: { message: 'productId is required' } }, { status: 400 });
    }

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace(/^Bearer /i, ''));
      if (user) {
        // Upsert or increment in cart_items
        const { data: existing } = await (supabase.from('cart_items') as any)
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .maybeSingle();

        if (existing) {
          await (supabase.from('cart_items') as any)
            .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        } else {
          await (supabase.from('cart_items') as any)
            .insert({ user_id: user.id, product_id: productId, quantity });
        }

        return NextResponse.json({ success: true, message: 'Item added to Supabase cart' });
      }
    }

    return NextResponse.json({ success: true, message: 'Item added to local session cart' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    const clearAll = url.searchParams.get('clear') === 'true';

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace(/^Bearer /i, ''));
      if (user) {
        if (clearAll) {
          await (supabase.from('cart_items') as any).delete().eq('user_id', user.id);
        } else if (productId) {
          await (supabase.from('cart_items') as any).delete().eq('user_id', user.id).eq('product_id', productId);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Cart updated' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 500 });
  }
}
