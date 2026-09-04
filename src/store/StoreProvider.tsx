'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { hydrateCart, loadCart } from '@/features/cart';
import { makeStore } from './store';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);
  useEffect(() => {
    const timer = window.setTimeout(() => store.dispatch(hydrateCart(loadCart())), 0);
    return () => window.clearTimeout(timer);
  }, [store]);
  return <Provider store={store}>{children}</Provider>;
}
