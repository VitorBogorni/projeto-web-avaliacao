// ==========================================================================
// TIPOS · Formato de um produto, do formulário e a lista de categorias.
// ==========================================================================
export interface Produto {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  rating?: number;
  // De onde veio: catálogo da API ou cadastrado pelo usuário neste navegador
  origem?: 'api' | 'local';
}

// Tipos para os formulários
export interface FormularioProduto {
  title: string;
  price: string;
  category: string;
  thumbnail: string;
  description: string;
}

// Categorias disponíveis no select
export const CATEGORIAS = [
  'beauty',
  'fragrances',
  'furniture',
  'groceries',
];

// Nome de cada categoria na tela (o valor em inglês é o que a API usa)
export const NOMES_CATEGORIAS: Record<string, string> = {
  beauty: 'Beleza',
  fragrances: 'Perfumes',
  furniture: 'Móveis',
  groceries: 'Mercado',
};

// Compatibilidade
export type GaleriaItem = Produto & {
  titulo?: string;
  descricao?: string;
  preco?: number;
  categoria?: string;
  imagemUrl?: string;
  status?: string;
};
