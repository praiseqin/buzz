/** @type {import('next').NextConfig} */
const nextConfig = {
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
