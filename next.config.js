/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  // Enable if you want to use experimental features
  experimental: {
    // serverActions: true,
  },
}

module.exports = nextConfig
