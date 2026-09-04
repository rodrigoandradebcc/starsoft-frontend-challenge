import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import PageTransition from './PageTransition';

jest.mock('next/navigation', () => ({ usePathname: () => '/products/1' }));
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  m: { div: 'div' },
}));

describe('PageTransition', () => {
  it('renders its children', () => {
    render(
      <PageTransition>
        <p>Conteúdo da página</p>
      </PageTransition>,
    );
    expect(screen.getByText('Conteúdo da página')).toBeInTheDocument();
  });
});
