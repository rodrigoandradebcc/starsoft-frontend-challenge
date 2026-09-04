import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import type { ReactNode } from 'react';
import Footer from '@/components/layout/Footer/Footer';
import Header from '@/components/layout/Header/Header';
import { Providers } from './providers';
import '@/styles/globals.scss';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Starsoft NFT Marketplace', template: '%s | Starsoft' },
  description: 'Descubra itens únicos e monte sua coleção no marketplace da Starsoft.',
  openGraph: {
    title: 'Starsoft NFT Marketplace',
    description: 'Marketplace de colecionáveis digitais.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export const viewport: Viewport = {
  themeColor: '#191a20',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body>
        <noscript>
          <style>{`img { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        <a className="skipLink" href="#conteudo">
          Pular para o conteúdo
        </a>
        <Providers>
          <div className="shell">
            <Header />
            <div className="main">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
