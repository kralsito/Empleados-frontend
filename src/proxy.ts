import { NextRequest, NextResponse } from 'next/server';

type UserRole = 'ADMIN' | 'USER';

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return atob(padded);
}

function getRoleFromToken(token: string | undefined): UserRole | null {
  if (!token) return null;

  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const parsed = JSON.parse(decodeBase64Url(payload)) as { role?: unknown; exp?: unknown };
    if (typeof parsed.exp === 'number' && parsed.exp * 1000 < Date.now()) {
      return null;
    }

    return parsed.role === 'ADMIN' || parsed.role === 'USER' ? parsed.role : null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  const role = getRoleFromToken(token);

  if (pathname === '/') {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/usuarios', request.url));
    }

    if (role === 'USER') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  if (!role) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (role === 'ADMIN' && !pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin/usuarios', request.url));
  }

  if (role === 'USER' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/configuracion/:path*', '/horarios-pagos/:path*', '/admin/:path*'],
};
