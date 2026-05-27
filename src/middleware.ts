import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Define which routes to protect
export const config = {
  matcher: [
    '/api/posts/:path*',
    '/api/users/me',
    '/api/upload',
  ],
};

export async function middleware(request: NextRequest) {
  // Allow GET requests for posts (public read access)
  if (request.nextUrl.pathname.startsWith('/api/posts') && request.method === 'GET') {
    return NextResponse.next();
  }

  let token: string | null = null;
  const authHeader = request.headers.get("authorization");
  
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    token = request.cookies.get("token")?.value || null;
  }

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Token is valid, proceed
  return NextResponse.next();
}
