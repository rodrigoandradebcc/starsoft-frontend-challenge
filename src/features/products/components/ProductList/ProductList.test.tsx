import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductList from './ProductList';

jest.mock('@tanstack/react-query', () => ({
  infiniteQueryOptions: (options: unknown) => options,
  useSuspenseInfiniteQuery: jest.fn(),
}));
jest.mock('@/features/products/components/ProductCard/ProductCard', () => ({
  __esModule: true,
  default: ({ product }: { product: { name: string } }) => <article>{product.name}</article>,
}));

const mockedQuery = jest.mocked(useSuspenseInfiniteQuery);
const product = {
  id: '1',
  name: 'Orb',
  description: 'Magic',
  image: 'https://softstar.s3.amazonaws.com/items/orb.png',
  price: 2,
  createdAt: '',
};

describe('ProductList', () => {
  it('loads the next page', async () => {
    const fetchNextPage = jest.fn();
    mockedQuery.mockReturnValue({
      data: {
        pages: [{ products: [product], page: 1, rows: 8, total: 9, hasNextPage: true }],
        pageParams: [1],
      },
      hasNextPage: true,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      fetchNextPage,
    } as never);
    render(<ProductList />);
    await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }));
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it('renders the empty state', () => {
    mockedQuery.mockReturnValue({
      data: {
        pages: [{ products: [], page: 1, rows: 8, total: 0, hasNextPage: false }],
        pageParams: [1],
      },
      hasNextPage: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      fetchNextPage: jest.fn(),
    } as never);
    render(<ProductList />);
    expect(screen.getByRole('heading', { name: 'Nenhum produto encontrado' })).toBeInTheDocument();
  });

  it('offers retry after a pagination error', async () => {
    const fetchNextPage = jest.fn();
    mockedQuery.mockReturnValue({
      data: {
        pages: [{ products: [product], page: 1, rows: 8, total: 9, hasNextPage: true }],
        pageParams: [1],
      },
      hasNextPage: true,
      isFetchingNextPage: false,
      isFetchNextPageError: true,
      fetchNextPage,
    } as never);
    render(<ProductList />);
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(fetchNextPage).toHaveBeenCalled();
  });
});
