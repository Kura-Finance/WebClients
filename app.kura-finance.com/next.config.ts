import type { NextConfig } from "next";
import path from "path";

/**
 * Build Mode Configuration
 * 
 * Set BUILD_MODE environment variable to choose output:
 * - 'standalone': Dynamic server app (default)
 *   npm run build
 * 
 * - 'export': Static HTML/CSS/JS (for CDN)
 *   BUILD_MODE=export npm run build
 */
const BUILD_MODE = process.env.BUILD_MODE || 'standalone';

const nextConfig: NextConfig = {
  // Dynamic or static output based on BUILD_MODE
  ...(BUILD_MODE === 'export' ? {
    output: 'export',
    trailingSlash: true,
  } : {
    output: 'standalone',
  }),
  
  turbopack: {
    root: path.join(__dirname),
  },
  
  /**
   * Rewrites for API routes
   * Forwards all /api/* requests to backend server
   */
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/:path*`,
        },
      ],
    };
  },
  
  async headers() {
    // CSP is now handled by middleware (middleware.ts) for dynamic origin support
    // This keeps other security headers
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'fullscreen=*',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "http",
        hostname: "googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "www.google.com", // 💡 換成 Google Favicon API 網域      
      },
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
      },
      {
        protocol: "https",
        hostname: "img.logo.dev",
      },
    ],
  },
};

export default nextConfig;
