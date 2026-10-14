// ==========================================================================
// BACK-END · Login e sessão.
// Confere e-mail e senha e cria um "token" assinado que fica num cookie.
// A assinatura (HMAC) impede que alguém invente um token sem saber o segredo.
// ==========================================================================
import { createHmac, timingSafeEqual } from 'crypto';

export const COOKIE_SESSAO = 'sessao';
export const DURACAO_SESSAO_SEGUNDOS = 8 * 60 * 60; // 8 horas

// Valores secretos vêm de variáveis de ambiente (nunca escritos no código):
// no PC ficam no arquivo .env.local; em produção, no painel da Vercel.
// Lista das variáveis (sem valores) em .env.example.
const SEGREDO = process.env.SESSAO_SEGREDO ?? '';

export interface Usuario {
  nome: string;
  email: string;
}

// Usuário administrador (configurado nas variáveis de ambiente)
const USUARIOS = [
  {
    nome: process.env.ADMIN_NOME || 'Administrador',
    email: (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase(),
    senha: process.env.ADMIN_SENHA ?? '',
  },
];

const configurado = () => SEGREDO.length >= 16 && USUARIOS.every((u) => u.email && u.senha);

function assinar(texto: string) {
  return createHmac('sha256', SEGREDO).update(texto).digest('base64url');
}

function comparar(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

// Devolve o usuário se e-mail e senha conferem; senão, null
export function autenticar(email: string, senha: string): Usuario | null {
  if (!configurado()) {
    console.error('[login] Configure SESSAO_SEGREDO, ADMIN_EMAIL e ADMIN_SENHA nas variáveis de ambiente.');
    return null;
  }
  const encontrado = USUARIOS.find((u) => u.email === email.trim().toLowerCase());
  if (!encontrado || !comparar(encontrado.senha, senha)) return null;
  return { nome: encontrado.nome, email: encontrado.email };
}

// Token = dados do usuário + validade, em base64, + assinatura
export function criarToken(usuario: Usuario) {
  const dados = Buffer.from(
    JSON.stringify({ ...usuario, expira: Date.now() + DURACAO_SESSAO_SEGUNDOS * 1000 })
  ).toString('base64url');
  return `${dados}.${assinar(dados)}`;
}

// Confere a assinatura e a validade; devolve o usuário ou null
export function lerToken(token: string | undefined): Usuario | null {
  if (!token || !configurado()) return null;
  const [dados, assinatura] = token.split('.');
  if (!dados || !assinatura || !comparar(assinatura, assinar(dados))) return null;
  try {
    const sessao = JSON.parse(Buffer.from(dados, 'base64url').toString());
    if (typeof sessao.expira !== 'number' || sessao.expira < Date.now()) return null;
    return { nome: sessao.nome, email: sessao.email };
  } catch {
    return null;
  }
}
