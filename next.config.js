/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://34.61.174.107/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
