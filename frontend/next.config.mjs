/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    const backendUrl = (process.env.BACKEND_API_URL || 'http://backend:8080').replace(/\/+$/, '');

    return [
      {
        source: '/swagger-ui/:path*',
        destination: `${backendUrl}/swagger-ui/:path*`,
      },
      {
        source: '/v3/api-docs/:path*',
        destination: `${backendUrl}/v3/api-docs/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
