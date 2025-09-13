/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const baseConfig = {
  allowedDevOrigins: [
    'http://192.168.29.127:3000',
  ],

  images: {
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
        pathname: '/api/V0/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'newsinhealth.nih.gov',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        pathname: '/**',
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // 🔥 Important: keep console clean in prod
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error'] }
        : false,
  },
};

module.exports = withPWA(baseConfig);
