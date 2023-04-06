/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://whisper-jax.ngrok.io/:path*',
      },
    ]
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'poe.com',
        port: '',
        pathname: '/_next/**',
      },
    ],
  },
}

module.exports = nextConfig
