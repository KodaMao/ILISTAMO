/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // typedRoutes is not supported in Next.js 14, remove if error persists
  // typedRoutes: true,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-select',
    ],
  },
};

export default nextConfig;
