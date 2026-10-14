// ==========================================================================
// LAYOUT · Moldura de todas as páginas: menu no topo, conteúdo, rodapé
// e o painel "Requisições". Também define a fonte e o idioma (pt-BR).
// ==========================================================================
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import RegistroApi from '@/components/RegistroApi';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--fonte',
});

export const metadata: Metadata = {
  title: 'Catálogo de Produtos',
  description: 'Catálogo de produtos que consome a API REST pública DummyJSON (GET, POST e DELETE).',
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
          <footer className="rodape">
            <div className="rodape-interno">
              <span>Avaliação 2 · Desenvolvimento Web</span>
              <span>Front-end e API própria em Next.js</span>
            </div>
          </footer>
        </div>
        <RegistroApi />
      </body>
    </html>
  );
}
