import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders the copyright notice', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      'STARSOFT © TODOS OS DIREITOS RESERVADOS',
    );
  });
});
