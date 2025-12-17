/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Optionally, you can configure the workbox options
  // buildExcludes: [/middleware-manifest\.json$/],
  // runtimeCaching: [...]
})

const nextConfig = {
  reactStrictMode: true,
  // Autres configurations Next.js ici si nécessaire
}

module.exports = withPWA(nextConfig)
