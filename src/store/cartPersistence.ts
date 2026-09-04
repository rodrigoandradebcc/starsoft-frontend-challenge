import type { CartItem } from './cartSlice';

interface PersistedCart {
  version: 1;
  items: CartItem[];
}

function isValidItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.description === 'string' &&
    typeof item.image === 'string' &&
    item.image.startsWith('https://softstar.s3.amazonaws.com/items/') &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    typeof item.createdAt === 'string' &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    item.quantity <= 99
  );
}

export function parseCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw) as Partial<PersistedCart>;
    if (value.version !== 1 || !Array.isArray(value.items)) return [];
    return value.items.filter(isValidItem);
  } catch {
    return [];
  }
}

export function serializeCart(items: CartItem[]): string {
  return JSON.stringify({ version: 1, items } satisfies PersistedCart);
}
