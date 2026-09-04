import reducer, { addItem, decreaseItem, removeItem } from './cartSlice';
const product = {
  id: '1',
  name: 'Orb',
  description: 'Magic orb',
  image: 'https://softstar.s3.amazonaws.com/items/orb.png',
  price: 2,
  createdAt: '',
};
describe('cartSlice', () => {
  it('adds, increments, decreases and removes items', () => {
    let state = reducer(undefined, addItem(product));
    state = reducer(state, addItem(product));
    expect(state.items[0].quantity).toBe(2);
    state = reducer(state, decreaseItem('1'));
    expect(state.items[0].quantity).toBe(1);
    state = reducer(state, removeItem('1'));
    expect(state.items).toHaveLength(0);
  });
});
