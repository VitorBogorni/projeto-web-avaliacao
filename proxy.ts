// ==========================================================================
// PROTEÇÃO DAS PÁGINAS · Roda no servidor antes de abrir qualquer página ou rota.
// Sem sessão válida: páginas vão para /login e a API responde 401.
// ==========================================================================
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_SESSAO, lerToken } from '@/lib/servidor/sessao';

// Caminhos que abrem sem login
const LIVRES = ['/login', '/api/login', '/api/logout', '/api'];

export function proxy(requisicao: NextRequest) {
  const { pathname, search } = requisicao.nextUrl;
  const logado = lerToken(requisicao.cookies.get(COOKIE_SESSAO)?.value) !== null;

  // Quem já entrou e abre o login vai direto para o catálogo
  if (pathname === '/login' && logado) {
    return NextResponse.redirect(new URL('/', requisicao.url));
  }

  if (logado || LIVRES.includes(pathname)) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ erro: 'Faça login para continuar.' }, { status: 401 });
  }

  const login = new URL('/login', requisicao.url);
  if (pathname !== '/') login.searchParams.set('voltar', pathname + search);
  return NextResponse.redirect(login);
}

// Não passa pelo proxy: arquivos do Next, imagens e o ícone
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)'],
};
