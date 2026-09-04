import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  sassOptions: { includePaths: [path.join(process.cwd(), 'src/styles')] },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'softstar.s3.amazonaws.com', pathname: '/items/**' },
    ],
  },
};

export default nextConfig;
