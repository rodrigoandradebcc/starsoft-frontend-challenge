import { productsService } from './products.service';
describe('productsService', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });
  it('normalizes API products and derives pagination', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          products: [
            {
              id: 1,
              name: 'Orb',
              description: 'Magic',
              image: 'https://softstar.s3.amazonaws.com/items/orb.png',
              price: '0.35000000',
              createdAt: '',
            },
          ],
          count: 9,
        }),
        { status: 200 },
      ),
    );
    await expect(productsService.list({ page: 1, rows: 8 })).resolves.toMatchObject({
      products: [{ id: '1', price: 0.35 }],
      total: 9,
      hasNextPage: true,
    });
  });

  it('rejects malformed API products', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ products: [{ id: 1, price: 'NaN' }], count: 1 })),
      );
    await expect(productsService.list()).rejects.toThrow('Invalid product data');
  });
});
