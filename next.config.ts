/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  allowedDevOrigins: [
    'http://192.168.29.127:3000', // must match the browser address exactly
  ],
  images: {
    // Domains list for compatibility alongside remotePatterns
    domains: [
      'hygo-backend.onrender.com',
      'images.unsplash.com',
      'newsinhealth.nih.gov',
      'res.cloudinary.com',
      'ui-avatars.com',
      'img.freepik.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hygo-backend.onrender.com',
        port: '',
        pathname: '/api/V0/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'newsinhealth.nih.gov',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = withPWA(nextConfig);
