'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { LazyMotion, MotionConfig } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { createQueryClient } from '@/lib/query/client';
import { StoreProvider } from '@/store/StoreProvider';

const loadMotionFeatures = () => import('@/lib/motion/features').then((module) => module.default);

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <StoreProvider>
      <QueryClientProvider client={queryClient}>
        <LazyMotion features={loadMotionFeatures} strict>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LazyMotion>
      </QueryClientProvider>
    </StoreProvider>
  );
}
