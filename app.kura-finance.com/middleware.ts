import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get the request origin (protocol + host)
  const requestOrigin = request.nextUrl.origin;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Define the app domain and API domain
  const appDomain = process.env.NEXT_PUBLIC_APP_URL || requestOrigin;
  const apiDomain = process.env.NEXT_PUBLIC_API_URL || 'https://api.kura-finance.com';

  // Define CSP sources
  const connectSources = [
    "'self'",
    requestOrigin,
    appDomain,
    apiDomain,
    'https://cdn.plaid.com',
    'https://*.plaid.com',
    'https://*.coingecko.com',
    'https://api.coingecko.com',
    'wss://relay.reown.com',
    'wss://*.reown.com',
    'https://api.reown.org',
    'https://static.cloudflareinsights.com', // Cloudflare Insights
    'https://app.kura-finance.com', // Explicitly add app domain
    'https://api.kura-finance.com', // Explicitly add API domain
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

  // Allow cross-origin resource sharing for scripts
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
