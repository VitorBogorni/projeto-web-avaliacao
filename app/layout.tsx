import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Catálogo de Produtos - API REST Pública',
  description: 'Aplicação Web simples consumindo API pública REST DummyJSON (GET, POST, DELETE).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <a href="#conteudo-principal" className="skip-link">
          Pular para o conteúdo principal
        </a>

        <div className="site-wrapper">
          <Navbar />
          <main id="conteudo-principal" className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
