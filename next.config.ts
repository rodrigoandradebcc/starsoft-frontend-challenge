import type { NextConfig } from 'next';
import path from 'node:path';
import { ALLOWED_IMAGE_HOSTS } from './src/lib/config/images';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: process.env.VERCEL ? undefined : 'standalone',
  sassOptions: { includePaths: [path.join(process.cwd(), 'src/styles')] },
  images: {
    remotePatterns: ALLOWED_IMAGE_HOSTS.map((hostname) => ({
      protocol: 'https' as const,
      hostname,
    })),
  },
};

export default nextConfig;
