'use client';
import { useEffect } from 'react';

/** Congela a rolagem do documento enquanto uma camada modal estiver aberta. */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}
