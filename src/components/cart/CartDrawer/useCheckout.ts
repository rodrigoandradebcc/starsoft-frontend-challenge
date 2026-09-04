'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { clearCart } from '@/store/cartSlice';
import { useAppDispatch } from '@/store/hooks';

/** Tempo que a confirmação de compra permanece visível. */
const CONFIRMATION_MS = 2200;

/**
 * Checkout simulado: esvazia o carrinho e mantém a confirmação por alguns
 * segundos antes de devolver o botão ao estado normal.
 */
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
