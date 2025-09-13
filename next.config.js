// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],
  },

  webpack: (config) => {
    // Add TypeScript file extensions
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  },

  typescript: {
    // Stop build if type errors exist
    ignoreBuildErrors: false,
  },

  reactStrictMode: true,

  compiler: {
    styledComponents: true,

    // 🚀 Remove all console logs in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error'] } // keep error logs, remove others
        : false,
  },

  modularizeImports: {
    '@heroicons/react/solid': {
      transform: '@heroicons/react/solid/{{member}}',
    },
  },
};

module.exports = nextConfig;
