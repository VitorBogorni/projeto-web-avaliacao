// ==========================================================================
// BACK-END · Login e sessão.
// Confere e-mail e senha e cria um "token" assinado que fica num cookie.
// A assinatura (HMAC) impede que alguém invente um token sem saber o segredo.
// ==========================================================================
import { createHmac, timingSafeEqual } from 'crypto';

export const COOKIE_SESSAO = 'sessao';
export const DURACAO_SESSAO_SEGUNDOS = 8 * 60 * 60; // 8 horas

const SEGREDO = process.env.SESSAO_SEGREDO || 'catalogo-de-produtos-segredo-de-desenvolvimento';

export interface Usuario {
  nome: string;
  email: string;
}

// Usuário de acesso para a demonstração (sem banco de dados, como permite o enunciado)
const USUARIOS = [
  {
    nome: 'Administrador',
    email: 'admin@catalogo.com',
    senha: process.env.SENHA_ADMIN || 'catalogo123',
  },
];

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
  if (!token) return null;
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
