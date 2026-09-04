'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { hydrateCart } from './cartSlice';
import { parseCart, serializeCart } from './cartPersistence';
import { makeStore } from './store';

const storageKey = 'starsoft-cart-v1';
export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);
  useEffect(() => {
    const hydrateTimer = window.setTimeout(() => {
      try {
        store.dispatch(hydrateCart(parseCart(localStorage.getItem(storageKey))));
      } catch {
        store.dispatch(hydrateCart([]));
      }
    }, 0);
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      if (state.cart.hydrated) localStorage.setItem(storageKey, serializeCart(state.cart.items));
    });
    return () => {
      window.clearTimeout(hydrateTimer);
      unsubscribe();
    };
  }, [store]);
  return <Provider store={store}>{children}</Provider>;
}
