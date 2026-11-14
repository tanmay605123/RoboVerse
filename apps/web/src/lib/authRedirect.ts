export type RoboVerseRole = 'student' | 'teacher' | 'institution_admin' | 'admin' | 'store_admin';

export function getRoleDashboardPath(role?: string | null): string {
  switch (role) {
    case 'teacher':
      return '/teacher';
    case 'institution_admin':
      return '/institution';
    case 'admin':
      return '/admin';
    case 'store_admin':
      return '/store-admin';
    case 'student':
    default:
      return '/dashboard';
  }
}

export function getSafeRedirectUrl(requestedNextUrl?: string | null, role?: string | null): string {
  if (requestedNextUrl && requestedNextUrl.startsWith('/') && !requestedNextUrl.startsWith('//')) {
    // Prevent redirect loop to auth pages
    if (!requestedNextUrl.startsWith('/login') && !requestedNextUrl.startsWith('/register')) {
      return requestedNextUrl;
    }
  }
  return getRoleDashboardPath(role);
}
