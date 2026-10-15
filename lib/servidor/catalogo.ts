// ==========================================================================
// BACK-END · "Banco" da API: lista em memória do servidor, que começa vazia.
// O enunciado permite retorno mockado (sem banco de dados).
// Na Vercel a memória zera quando o servidor reinicia; por isso o front
// também guarda no navegador o que foi cadastrado e excluído.
// ==========================================================================
import { FormularioProduto, Produto } from '@/types/item';
import { converterPreco, ErrosFormulario, validarCampo } from '@/lib/validacao';

const global = globalThis as typeof globalThis & { __catalogo?: Produto[] };

// Produtos com que o catálogo começa (iguais em todas as cópias do servidor)
const PRODUTOS_INICIAIS: Produto[] = [
  {
    id: 1,
    title: 'Perfume CK One 100 ml',
    category: 'Perfumes',
    price: 349.9,
    thumbnail: 'https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/thumbnail.webp',
    description: 'Perfume unissex com notas cítricas e frescas, frasco de 100 ml.',
  },
  {
    id: 2,
    title: 'Cama de casal Colombo',
    category: 'Móveis',
    price: 2499.9,
    thumbnail: 'https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp',
    description: 'Cama de casal com cabeceira estofada e acabamento em madeira.',
  },
];

function catalogo(): Produto[] {
  global.__catalogo ??= PRODUTOS_INICIAIS.map((p) => ({ ...p }));
  return global.__catalogo;
}

export function listar(filtros: { busca?: string; categoria?: string }) {
  const busca = (filtros.busca ?? '').trim().toLowerCase();
  return catalogo().filter(
    (p) =>
      (!busca || p.title.toLowerCase().includes(busca)) &&
      (!filtros.categoria || p.category === filtros.categoria)
  );
}

export function obter(id: number) {
  return catalogo().find((p) => p.id === id) ?? null;
}

// Converte o corpo da requisição para o formato do formulário (tudo texto)
// e valida com as mesmas regras da tela.
const CAMPOS: (keyof FormularioProduto)[] = ['title', 'category', 'price', 'thumbnail', 'description'];

function comoTexto(valor: unknown) {
  return typeof valor === 'string' || typeof valor === 'number' ? String(valor) : '';
}

export function validar(corpo: Record<string, unknown>, parcial = false) {
  const erros: ErrosFormulario = {};
  for (const campo of CAMPOS) {
    if (parcial && !(campo in corpo)) continue;
    const erro = validarCampo(campo, comoTexto(corpo[campo]));
    if (erro) erros[campo] = erro;
  }
  return erros;
}

function normalizarDados(corpo: Record<string, unknown>) {
  const dados: Partial<Produto> = {};
  if ('title' in corpo) dados.title = comoTexto(corpo.title).trim();
  if ('category' in corpo) dados.category = comoTexto(corpo.category).trim();
  if ('price' in corpo) dados.price = converterPreco(comoTexto(corpo.price));
  if ('thumbnail' in corpo) dados.thumbnail = comoTexto(corpo.thumbnail).trim();
  if ('description' in corpo) dados.description = comoTexto(corpo.description).trim();
  return dados;
}

export function criar(corpo: Record<string, unknown>): Produto {
  const lista = catalogo();
  // Código único e crescente (o maior entre o horário atual e o último código + 1)
  const id = Math.max(Date.now(), ...lista.map((p) => p.id + 1));
  const produto = { id, ...normalizarDados(corpo) } as Produto;
  lista.unshift(produto);
  return produto;
}

export function atualizar(id: number, corpo: Record<string, unknown>) {
  const produto = obter(id);
  if (!produto) return null;
  Object.assign(produto, normalizarDados(corpo));
  return produto;
}

export function remover(id: number) {
  const lista = catalogo();
  const indice = lista.findIndex((p) => p.id === id);
  if (indice < 0) return false;
  lista.splice(indice, 1);
  return true;
}

// Quantos produtos do servidor usam a categoria (para não excluir categoria em uso)
export function contarPorCategoria(nome: string) {
  return catalogo().filter((p) => p.category === nome).length;
}
