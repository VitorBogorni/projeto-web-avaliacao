'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-brand">
          Catálogo de Produtos
        </Link>

        {/* Menu Desktop */}
        <nav className="navbar-menu" aria-label="Navegação principal">
          <Link href="/" className="nav-link">
            Início
          </Link>
          <Link href="/novo" className="btn-novo">
            + Novo Produto
          </Link>
        </nav>

        {/* Botão Mobile */}
        <button
          type="button"
          onClick={() => setMenuAberto(!menuAberto)}
          className="menu-mobile-btn"
          aria-label="Abrir ou fechar menu"
          aria-expanded={menuAberto}
        >
          Menu
        </button>
      </div>

      {/* Menu Mobile Aberto */}
      {menuAberto && (
        <div className="navbar-mobile">
          <Link href="/" onClick={() => setMenuAberto(false)} className="nav-link-mobile">
            Início
          </Link>
          <Link href="/novo" onClick={() => setMenuAberto(false)} className="btn-novo-mobile">
            + Novo Produto
          </Link>
        </div>
      )}
    </header>
  );
}
