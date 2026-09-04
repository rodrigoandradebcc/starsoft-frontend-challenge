import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { addItem, clearCart, decreaseItem, removeItem } from './cartSlice';
import { saveCart } from './cartStorage';
import type { RootState } from '@/store/store';

export function createCartPersistenceMiddleware() {
  const listener = createListenerMiddleware();
  listener.startListening({
    matcher: isAnyOf(addItem, removeItem, decreaseItem, clearCart),
    effect: (_action, api) => {
      const { items, hydrated } = (api.getState() as RootState).cart;
      if (!hydrated) return;
      saveCart(items);
    },
  });
  return listener;
}
