// ==========================================================================
// LAYOUT · Moldura de todas as páginas: menu no topo e conteúdo.
// Também define a fonte e o idioma (pt-BR).
// ==========================================================================
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--fonte',
});

export const metadata: Metadata = {
  title: 'Catálogo de Produtos',
  description: 'Catálogo de produtos com telas e API REST próprias em Next.js (GET, POST, PATCH e DELETE).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <a href="#conteudo-principal" className="skip-link">
          Pular para o conteúdo principal
        </a>

        <div className="site">
          <Navbar />
          <main id="conteudo-principal" className="conteudo">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
