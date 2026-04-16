import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get the request origin (protocol + host)
  const requestOrigin = request.nextUrl.origin;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Define CSP sources
  const connectSources = [
    "'self'",
    requestOrigin, // Allow requests to the current domain
    'https://cdn.plaid.com',
    'https://*.plaid.com',
    'https://*.coingecko.com',
    'https://api.coingecko.com',
    'wss://relay.reown.com',
    'wss://*.reown.com',
    'https://api.reown.org',
    'https://static.cloudflareinsights.com', // Cloudflare Insights
    'https://kura.dpdns.org', // Explicit self-domain for reverse proxy
    ...(isDevelopment ? ['ws://localhost', 'ws://127.0.0.1'] : []), // Allow WebSocket for dev HMR
  ].filter(Boolean).join(' ');

  const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    ...(isDevelopment ? ["'unsafe-eval'"] : []), // Allow eval() for React dev mode debugging
    'https://cdn.plaid.com',
    'https://*.plaid.com',
    'https://static.cloudflareinsights.com', // Cloudflare Insights
  ].join(' ');

  // Set CSP header
  response.headers.set(
    'Content-Security-Policy',
    `
      default-src 'self';
      script-src ${scriptSources};
      connect-src ${connectSources};
      img-src 'self' data: https: blob:;
      font-src 'self' data: https:;
      style-src 'self' 'unsafe-inline';
      frame-src 'self' https://cdn.plaid.com https://*.plaid.com wss://relay.reown.com wss://*.reown.com;
    `.replace(/\s+/g, ' ').trim()
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
