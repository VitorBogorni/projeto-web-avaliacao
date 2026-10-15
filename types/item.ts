// ==========================================================================
// TIPOS · Formato de um produto, de uma categoria e do formulário.
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

// Categoria: o produto guarda o nome dela (ex.: "Perfumes")
export interface Categoria {
  id: string;
  nome: string;
  // De onde veio: servidor ou cadastrada neste navegador
  origem?: 'api' | 'local';
}

// Categorias com que o sistema começa (podem ser excluídas e novas podem ser cadastradas)
export const CATEGORIAS_INICIAIS = ['Beleza', 'Perfumes', 'Móveis', 'Mercado'];

export const LIMITES_CATEGORIA = { min: 2, max: 30 };

// Nomes antigos em inglês (de testes anteriores) mostrados em português
export const NOMES_CATEGORIAS: Record<string, string> = {
  beauty: 'Beleza',
  fragrances: 'Perfumes',
  furniture: 'Móveis',
  groceries: 'Mercado',
};
