'use client';

// ==========================================================================
// COMPONENTE · Menu do topo. No celular vira um botão que abre e fecha.
// Mostra quem está logado e o botão Sair. Na tela de login mostra só a marca.
// ==========================================================================
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, LogOut, Menu, Package, Plus, Tags, X } from 'lucide-react';
import { sair, sessaoAtual, Usuario } from '@/lib/api';

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const caminho = usePathname();
  const router = useRouter();
  const naLista = caminho === '/' || caminho.startsWith('/produtos');
  const noLogin = caminho === '/login';
  const fechar = () => setMenuAberto(false);

  // Descobre quem está logado (GET /api/sessao)
  useEffect(() => {
    if (noLogin) return;
    let ativo = true;
    sessaoAtual().then((u) => {
      if (ativo) setUsuario(u);
    });
    return () => {
      ativo = false;
    };
  }, [noLogin]);

  async function sairDoSistema() {
    try {
      await sair();
    } finally {
      router.replace('/login');
      router.refresh();
    }
  }

  const marca = (
    <Link href="/" className="marca" onClick={fechar}>
      <span className="marca-icone" aria-hidden="true">
        <Package size={20} strokeWidth={2.2} />
      </span>
      <span className="marca-texto">
        <span className="marca-nome">Catálogo</span>
        <span className="marca-sub">de Produtos</span>
      </span>
    </Link>
  );

  if (noLogin) {
    return (
      <header className="navbar">
        <div className="navbar-interno">{marca}</div>
      </header>
    );
  }

  return (
    <header className="navbar">
      <div className="navbar-interno">
        {marca}

        <nav className="navbar-links" aria-label="Navegação principal">
          <Link href="/" className="nav-link" aria-current={naLista ? 'page' : undefined}>
            <LayoutGrid size={18} aria-hidden="true" />
            Produtos
          </Link>
          <Link href="/categorias" className="nav-link" aria-current={caminho === '/categorias' ? 'page' : undefined}>
            <Tags size={18} aria-hidden="true" />
            Categorias
          </Link>
          <Link href="/novo" className="botao botao-primario" aria-current={caminho === '/novo' ? 'page' : undefined}>
            <Plus size={18} aria-hidden="true" />
            Novo produto
          </Link>
          <span className="navbar-divisor" aria-hidden="true" />
          {usuario && (
            <span className="usuario" title={usuario.email}>
              <span className="usuario-avatar" aria-hidden="true">
                {usuario.nome.charAt(0)}
              </span>
              <span className="usuario-nome">{usuario.nome}</span>
            </span>
          )}
          <button type="button" className="botao botao-fantasma" onClick={sairDoSistema}>
            <LogOut size={18} aria-hidden="true" />
            Sair
          </button>
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
          {usuario && <p className="usuario-mobile">Conectado como {usuario.nome}</p>}
          <Link href="/" onClick={fechar} className="nav-link" aria-current={naLista ? 'page' : undefined}>
            <LayoutGrid size={18} aria-hidden="true" />
            Produtos
          </Link>
          <Link href="/categorias" onClick={fechar} className="nav-link" aria-current={caminho === '/categorias' ? 'page' : undefined}>
            <Tags size={18} aria-hidden="true" />
            Categorias
          </Link>
          <button type="button" className="nav-link" onClick={sairDoSistema}>
            <LogOut size={18} aria-hidden="true" />
            Sair
          </button>
          <Link href="/novo" onClick={fechar} className="botao botao-primario">
            <Plus size={18} aria-hidden="true" />
            Novo produto
          </Link>
        </nav>
      )}
    </header>
  );
}
