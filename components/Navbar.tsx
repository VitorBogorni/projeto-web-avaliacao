'use client';

// ==========================================================================
// COMPONENTE · Menu do topo. No celular vira um botão que abre e fecha.
// Marca o link da página atual (aria-current).
// ==========================================================================
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Menu, Package, Plus, X } from 'lucide-react';

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const caminho = usePathname();
  const naLista = caminho === '/' || caminho.startsWith('/produtos');
  const fechar = () => setMenuAberto(false);

  return (
    <header className="navbar">
      <div className="navbar-interno">
        <Link href="/" className="marca" onClick={fechar}>
          <span className="marca-icone" aria-hidden="true">
            <Package size={20} strokeWidth={2.2} />
          </span>
          <span className="marca-texto">
            <span className="marca-nome">Catálogo</span>
            <span className="marca-sub">de Produtos</span>
          </span>
        </Link>

        <nav className="navbar-links" aria-label="Navegação principal">
          <Link href="/" className="nav-link" aria-current={naLista ? 'page' : undefined}>
            <LayoutGrid size={18} aria-hidden="true" />
            Produtos
          </Link>
          <Link
            href="/novo"
            className="botao botao-primario"
            aria-current={caminho === '/novo' ? 'page' : undefined}
          >
            <Plus size={18} aria-hidden="true" />
            Novo produto
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuAberto(!menuAberto)}
          className="botao-icone navbar-menu-botao"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
          aria-controls="menu-mobile"
        >
          {menuAberto ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      {menuAberto && (
        <nav id="menu-mobile" className="navbar-mobile" aria-label="Navegação principal">
          <Link href="/" onClick={fechar} className="nav-link" aria-current={naLista ? 'page' : undefined}>
            <LayoutGrid size={18} aria-hidden="true" />
            Produtos
          </Link>
          <Link href="/novo" onClick={fechar} className="botao botao-primario">
            <Plus size={18} aria-hidden="true" />
            Novo produto
          </Link>
        </nav>
      )}
    </header>
  );
}
