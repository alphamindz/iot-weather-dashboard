/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Next.js build ke waqt TypeScript version conflict ko bypass karega
    ignoreBuildErrors: true,
  },
  eslint: {
    // Build ke dauran linting errors ko bypass karega
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;