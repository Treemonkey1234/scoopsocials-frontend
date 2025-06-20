/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable server-side rendering for pages that use client-side routing
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  // Output configuration for static export (optional)
  output: 'standalone',
}

module.exports = nextConfig; 