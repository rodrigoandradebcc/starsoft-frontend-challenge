import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { addItem, clearCart, decreaseItem, removeItem } from './cartSlice';
import { saveCart } from './cartStorage';
import type { RootState } from './store';

/**
 * Espelha o carrinho no `localStorage` a cada ação do usuário.
 *
 * Uma instância por store — instância compartilhada vazaria assinaturas entre
 * os stores criados nos testes. `hydrateCart` fica de fora do matcher: não faz
 * sentido regravar o que acabou de ser lido, e a guarda `hydrated` impede que
 * um clique anterior à hidratação sobrescreva o carrinho salvo.
 */
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
