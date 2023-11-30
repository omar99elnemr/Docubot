/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {

    domains: [
      'https://docubot-ten.vercel.app/',
    ],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "**",
      },
    ],
  },

    async redirects() {
      return [
        {
          source: '/sign-in',
          destination: '/api/auth/login',
          permanent: true,
        },
        {
          source: '/sign-up',
          destination: '/api/auth/register',
          permanent: true,
        },
      ]
    },
  
    webpack: (
      config,
      { buildId, dev, isServer, defaultLoaders, webpack }
    ) => {
      config.resolve.alias.canvas = false
      config.resolve.alias.encoding = false
      return config
    },
  }
  
  module.exports = nextConfig