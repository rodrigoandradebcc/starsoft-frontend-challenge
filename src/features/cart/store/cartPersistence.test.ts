import { parseCart, serializeCart } from './cartPersistence';

const item = {
  id: '1',
  name: 'Orb',
  description: 'Magic',
  image: 'https://softstar.s3.amazonaws.com/items/orb.png',
  price: 2,
  createdAt: '',
  quantity: 1,
};
describe('cartPersistence', () => {
  it('round-trips a versioned cart', () =>
    expect(parseCart(serializeCart([item]))).toEqual([item]));
  it('rejects malformed, stale and unsafe data', () => {
    expect(parseCart('{bad')).toEqual([]);
    expect(parseCart(JSON.stringify([item]))).toEqual([]);
    expect(
      parseCart(
        JSON.stringify({ version: 1, items: [{ ...item, image: 'https://evil.test/x.png' }] }),
      ),
    ).toEqual([]);
    expect(parseCart(JSON.stringify({ version: 1, items: [{ ...item, quantity: 0 }] }))).toEqual(
      [],
    );
  });
});
