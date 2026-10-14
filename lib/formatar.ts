// ==========================================================================
// FRONT · Formatação: preço em reais, nome da categoria em português, nota.
// ==========================================================================
import { NOMES_CATEGORIAS } from '@/types/item';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarPreco(valor: number) {
  return moeda.format(Number(valor) || 0);
}

export function nomeCategoria(categoria: string) {
  return NOMES_CATEGORIAS[categoria] ?? categoria;
}

export function formatarNota(nota: number) {
  return nota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// Compara sem diferenciar maiúsculas e acentos ("perfume" encontra "Perfúme")
export function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
