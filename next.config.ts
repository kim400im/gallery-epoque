import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/pb/:path*',
        destination: `${process.env.POCKETBASE_URL || 'http://pocketbase:8090'}/:path*`,
      },
    ]
  },
};

export default withNextIntl(nextConfig);
