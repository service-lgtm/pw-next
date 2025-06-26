/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  typescript: {
    // 在生产构建时忽略类型错误
    ignoreBuildErrors: true,
  },
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
