import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // typedRoutes: true, // Disabled due to build/type issues with dynamic routes
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-select',
    ],
  },
};

export default nextConfig;
