'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { hydrateCart } from './cartSlice';
import { loadCart } from './cartStorage';
import { makeStore } from './store';

/**
 * Cria a store por árvore de render e hidrata o carrinho salvo após a montagem.
 * A gravação fica a cargo do listener middleware, não deste componente.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);
  useEffect(() => {
    // Adiado para depois da hidratação do React, evitando divergência com o HTML do servidor.
    const timer = window.setTimeout(() => store.dispatch(hydrateCart(loadCart())), 0);
    return () => window.clearTimeout(timer);
  }, [store]);
  return <Provider store={store}>{children}</Provider>;
}
