import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/', '/login', '/register', '/terms', '/privacy', '/oauth2/callback'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/share/');

  // Allow API routes, static files, public assets, and NextAuth
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname === '/manifest.json' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // Check for JWT auth cookie (set by authStore on login, cleared on logout)
  const sessionToken = request.cookies.get('auth-token')?.value;

  // Redirect authenticated users away from login page
  if (pathname === '/login' && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow public paths through
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Protected route — redirect to login if no session
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, and common static file extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|xml)$).*)',
  ],
};
