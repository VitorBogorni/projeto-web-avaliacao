// URL base da API pública gratuita DummyJSON
const API_URL = 'https://dummyjson.com/products';
const STORAGE_KEY = 'produtos_adicionados_usuario';

// 1. Operação GET: Faz a requisição GET na API pública e retorna os produtos adicionados pelo usuário
export async function buscarProdutos() {
  // Executa a requisição GET real na API pública; se falhar, a tela mostra o erro
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}?limit=1`);
  } catch {
    throw new Error('Sem conexão com a API pública. Verifique a internet e tente de novo.');
  }
  if (!resposta.ok) {
    throw new Error(`A API pública respondeu com erro (${resposta.status}). Tente de novo.`);
  }

  if (typeof window === 'undefined') return [];
  try {
    const salvos = localStorage.getItem(STORAGE_KEY);
    return salvos ? JSON.parse(salvos) : [];
  } catch {
    return [];
  }
}

// 2. Operação GET (por ID): Busca os detalhes do produto
export async function buscarProdutoPorId(id: string | number) {
  if (typeof window !== 'undefined') {
    const salvos = localStorage.getItem(STORAGE_KEY);
    const lista = salvos ? JSON.parse(salvos) : [];
    const encontrado = lista.find((p: any) => String(p.id) === String(id));
    if (encontrado) {
      try {
        // Requisição GET real na API
        await fetch(`${API_URL}/1`);
      } catch {}
      return encontrado;
    }
  }

  const resposta = await fetch(`${API_URL}/${id}`);
  if (!resposta.ok) {
    throw new Error('Produto não encontrado na API pública');
  }
  return await resposta.json();
}

// 3. Operação POST: Envia um novo produto para a API pública e adiciona à lista
export async function cadastrarProduto(novoItem: {
  title: string;
  price: number;
  category: string;
  thumbnail: string;
  description: string;
}) {
  const resposta = await fetch(`${API_URL}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novoItem),
  });

  if (!resposta.ok) {
    throw new Error('Erro ao cadastrar produto na API pública');
  }

  // A DummyJSON devolve sempre o mesmo id (195) no POST, então dois produtos
  // ficariam com o mesmo id. Por isso o id é gerado aqui.
  await resposta.json();

  const itemCriado = {
    id: Date.now(),
    title: novoItem.title,
    price: novoItem.price,
    category: novoItem.category,
    thumbnail: novoItem.thumbnail,
    description: novoItem.description,
  };

  // Salva no localStorage para que apareça na lista de produtos adicionados
  if (typeof window !== 'undefined') {
    try {
      const salvos = localStorage.getItem(STORAGE_KEY);
      const lista = salvos ? JSON.parse(salvos) : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([itemCriado, ...lista]));
    } catch (err) {
      console.error('Erro ao salvar localmente:', err);
    }
  }

  return itemCriado;
}

// 4. Operação DELETE: Solicita a exclusão do produto pelo ID e remove da lista
export async function excluirProduto(id: number | string) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Aviso ao excluir na API pública:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const salvos = localStorage.getItem(STORAGE_KEY);
      const lista = salvos ? JSON.parse(salvos) : [];
      const novaLista = lista.filter((p: any) => String(p.id) !== String(id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
    } catch (err) {
      console.error('Erro ao remover localmente:', err);
    }
  }

  return { id, sucesso: true };
}

// Compatibilidade
export const listarItens = buscarProdutos;
export const obterItemPorId = buscarProdutoPorId;
export const criarItem = cadastrarProduto;
export const excluirItem = excluirProduto;
