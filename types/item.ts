export interface Produto {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  rating?: number;
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

// Compatibilidade
export type GaleriaItem = Produto & {
  titulo?: string;
  descricao?: string;
  preco?: number;
  categoria?: string;
  imagemUrl?: string;
  status?: string;
};
