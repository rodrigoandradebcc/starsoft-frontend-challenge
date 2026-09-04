import { parseCart, serializeCart } from './cartPersistence';
import type { CartItem } from './cartSlice';

const STORAGE_KEY = 'starsoft-cart-v1';

export function loadCart(): CartItem[] {
  try {
    return parseCart(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeCart(items));
  } catch {}
}
