'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { clearCart } from '@/store/cartSlice';
import { useAppDispatch } from '@/store/hooks';

const CONFIRMATION_MS = 2200;

export function useCheckout() {
  const dispatch = useAppDispatch();
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const finish = useCallback(() => {
    setFinished(true);
    dispatch(clearCart());
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setFinished(false), CONFIRMATION_MS);
  }, [dispatch]);

  return { finished, finish };
}
