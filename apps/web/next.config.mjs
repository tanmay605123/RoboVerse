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
  webpack: (config) => {
    config.externals = [...(config.externals || [])];
    return config;
  },
};

export default nextConfig;
