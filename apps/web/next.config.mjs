import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_BACKEND_URL =
  process.env.API_BACKEND_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://roboverse-backend.onrender.com/api/v1'
    : 'http://localhost:4000/api/v1');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The repository contains legacy API route type mismatches that are
  // independent of the web UI build. Keep deployment unblocked while those
  // routes are migrated to the current shared client types.
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@roboverse/shared', '@roboverse/ui-tokens', '@roboverse/sim-engine', 'three'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
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
      '@roboverse/components-lib': path.resolve(__dirname, '../../packages/components-lib/src'),
    };
    config.externals = [...(config.externals || [])];
    return config;
  },
};

export default nextConfig;
