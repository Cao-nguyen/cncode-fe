// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  reactStrictMode: true,
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: '/s/:shortCode',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/s/:shortCode`,
      },
      {
        source: '/track',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/affiliate/track`,
      },
    ];
  },
};

module.exports = nextConfig;