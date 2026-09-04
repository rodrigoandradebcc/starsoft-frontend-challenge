import { parseCart, serializeCart } from './cartPersistence';
import type { CartItem } from './cartSlice';

const STORAGE_KEY = 'starsoft-cart-v1';

/** Lê o carrinho salvo. Storage indisponível ou corrompido devolve carrinho vazio. */
export function loadCart(): CartItem[] {
  try {
    return parseCart(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

/** Grava o carrinho. Falha de cota ou modo privativo é ignorada de propósito. */
export function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeCart(items));
  } catch {}
}
