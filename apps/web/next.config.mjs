import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BACKEND_URL = process.env.API_BACKEND_URL || 'https://secretary-blogs-hired-lined.trycloudflare.com/api/v1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@roboverse/shared', '@roboverse/ui-tokens', '@roboverse/sim-engine', 'three'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=(self)',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${API_BACKEND_URL}/:path*`,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@roboverse/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@roboverse/ui-tokens': path.resolve(__dirname, '../../packages/ui-tokens/src'),
      '@roboverse/sim-engine': path.resolve(__dirname, '../../packages/sim-engine/src'),
    };
    config.externals = [...(config.externals || [])];
    return config;
  },
};

export default nextConfig;
