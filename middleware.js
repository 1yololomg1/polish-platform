import { NextResponse } from 'next/server';

// Blocked countries for petroleum data security
const BLOCKED_COUNTRIES = ['CN', 'RU', 'IR', 'KP', 'BY', 'MM'];

export async function middleware(request) {
  const response = NextResponse.next();
  
  // Geographic blocking for sensitive endpoints
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const country = request.headers.get('cf-ipcountry') || 
                   request.headers.get('x-vercel-ip-country') || 
                   'US'; // Default to US if unknown
    
    if (BLOCKED_COUNTRIES.includes(country)) {
      console.log(`SECURITY: Blocked access from ${country} to ${request.nextUrl.pathname}`);
      return new Response('Access denied', { status: 403 });
    }
  }
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: ['/((?!api/|_next/|_static/|favicon.ico).*)'],
};