import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database, DbUserRole } from '@roboverse/shared';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Backend JWT sessions are stored in browser localStorage and cannot be
  // inspected by edge middleware. Supabase cookie sessions are still checked
  // here when their public credentials are configured.
  let supabase: any = null;
  let user: any = null;
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as CookieOptions)
          );
        },
      },
    });

    const result = await supabase.auth.getUser();
    user = result.data.user;
  }

  const { pathname, search } = request.nextUrl;

  // 1. ADMIN PROTECTION (/admin and /api/admin/*)
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApiPath = pathname.startsWith('/api/admin');

  if (isAdminPath || isAdminApiPath) {
    if (!user) {
      if (isAdminApiPath) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
      // Rule: non-admins and signed-out visitors get 404 (do not leak that /admin exists)
      return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
    }

    // Verify role directly from database profiles table (never from user metadata)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = (profile as any)?.role as DbUserRole | undefined;

    if (role !== 'admin') {
      if (isAdminApiPath) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
      return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
    }

    // Verify MFA TOTP if enrolled
    try {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2' && !isDemoMode) {
        // Enrolled in MFA but not verified this session
        if (isAdminApiPath) {
          return NextResponse.json({ error: 'MFA Verification Required' }, { status: 403 });
        }
        const mfaUrl = new URL('/login', request.url);
        mfaUrl.searchParams.set('mfa', 'required');
        mfaUrl.searchParams.set('returnUrl', pathname + search);
        return NextResponse.redirect(mfaUrl);
      }
    } catch {
      // Ignore MFA inspection error if not configured
    }

    return response;
  }

  // 2. PROTECTED USER PATHS (Require authentication)
  const protectedUserPrefixes = [
    '/dashboard',
    '/workbench',
    '/robot-lab',
    '/rituu',
    '/challenges',
    '/classes',
    '/settings',
  ];

  const isProtectedUserPath = protectedUserPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedUserPath) {
    if (!user) {
      // Backend JWT auth is restored by useAuthStore on the client. The page
      // performs the final redirect if neither auth system has a session.
      return response;
    }
    return response;
  }

  // 3. ROLE-SPECIFIC WORKSPACE PROTECTION
  if (pathname.startsWith('/teacher')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?returnUrl=/teacher', request.url));
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    const role = (profile as any)?.role;
    if (role !== 'teacher' && role !== 'admin') {
      return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
    }
    return response;
  }

  if (pathname.startsWith('/institution')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?returnUrl=/institution', request.url));
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    const role = (profile as any)?.role;
    if (role !== 'institution_admin' && role !== 'admin') {
      return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
    }
    return response;
  }

  if (pathname.startsWith('/store-admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?returnUrl=/store-admin', request.url));
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    const role = (profile as any)?.role;
    if (role !== 'store_admin' && role !== 'admin') {
      return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
    }
    return response;
  }

  // 4. SIGNED-IN USERS VISITING /login OR /register REDIRECT TO WORKSPACE
  if ((pathname === '/login' || pathname === '/register') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = (profile as any)?.role as DbUserRole | undefined;

    switch (role) {
      case 'admin':
        return NextResponse.redirect(new URL('/admin', request.url));
      case 'teacher':
        return NextResponse.redirect(new URL('/teacher', request.url));
      case 'institution_admin':
        return NextResponse.redirect(new URL('/institution', request.url));
      case 'store_admin':
        return NextResponse.redirect(new URL('/store-admin', request.url));
      default:
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, assets, svg, mp3, gltf, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|mp4|gltf|bin|json)$).*)',
  ],
};
