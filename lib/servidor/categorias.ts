// ==========================================================================
// BACK-END · Categorias: lista em memória do servidor.
// Começa com Beleza, Perfumes, Móveis e Mercado (retorno mockado, sem banco).
// ==========================================================================
import { Categoria, CATEGORIAS_INICIAIS } from '@/types/item';
import { chaveCategoria } from '@/lib/validacao';

const global = globalThis as typeof globalThis & { __categorias?: Categoria[] };

// Código da categoria a partir do nome: "Móveis de Escritório" → "moveis-de-escritorio"
export function gerarId(nome: string) {
  return chaveCategoria(nome).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function categorias(): Categoria[] {
  global.__categorias ??= CATEGORIAS_INICIAIS.map((nome) => ({ id: gerarId(nome), nome }));
  return global.__categorias;
}

export function listarCategorias() {
  return [...categorias()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function nomesCategorias() {
  return categorias().map((c) => c.nome);
}

export function obterCategoria(id: string) {
  return categorias().find((c) => c.id === id) ?? null;
}

export function criarCategoria(nome: string): Categoria {
  const categoria = { id: gerarId(nome), nome: nome.trim() };
  categorias().push(categoria);
  return categoria;
}

export function removerCategoria(id: string) {
  const lista = categorias();
  const indice = lista.findIndex((c) => c.id === id);
  if (indice < 0) return false;
  lista.splice(indice, 1);
  return true;
}
