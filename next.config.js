// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
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
        hostname: 'cdn.pixabay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Add TypeScript file extensions
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  },
  typescript: {
    // Enable type checking during build
    ignoreBuildErrors: false,
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Enable SWC compiler with minification and optimizations
  compiler: {
    // Enable SWC minification
    removeConsole: process.env.NODE_ENV === 'production',
    // Enable styled-components support
    styledComponents: true,
  },
  // Configure modularize imports
  modularizeImports: {
    '@heroicons/react/solid': {
      transform: '@heroicons/react/solid/{{member}}',
    },
  },
};

module.exports = nextConfig;
