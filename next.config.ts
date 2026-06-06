const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  images: {
    unoptimized: isDev,
    remotePatterns: [
      { protocol: "https", hostname: "api.telegram.org" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
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