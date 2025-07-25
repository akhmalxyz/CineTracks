import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Update image configuration to use remotePatterns instead of domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/**',
      },
    ],
  },
  // Rewrites to proxy API requests to the backend services
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8081/api/auth/:path*', // Auth service
      },
      {
        source: '/api/catalog/:path*',
        destination: 'http://localhost:8082/api/catalog/:path*', // catalog service
      },
      
      {
        source: '/api/watchlist/:path*',
        destination: 'http://localhost:8083/api/watchlist/:path*', // watchlist service
      },
    ];
  },
};

export default nextConfig;
