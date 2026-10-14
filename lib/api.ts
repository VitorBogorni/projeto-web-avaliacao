// ==========================================================================
// FRONT · Comunicação com a API. As telas chamam estas funções e nunca o fetch direto.
// GET /api/produtos, GET /api/produtos/:id, POST /api/produtos, DELETE /api/produtos/:id.
// Cada requisição é registrada (console + painel) e todo erro vira ErroApi com o código HTTP.
// ==========================================================================
import { Produto } from '@/types/item';
import { descreverStatus, registrar } from '@/lib/registro';

// API própria do projeto (rotas em app/api/produtos)
const API_URL = '/api/produtos';

// O servidor guarda os dados em memória, que zera quando ele reinicia (ex.: na Vercel).
// Por isso o navegador também lembra o que cadastrou e o que excluiu.
const STORAGE_KEY = 'produtos_adicionados_usuario';
const EXCLUIDOS_KEY = 'produtos_excluidos';

// Erro com o código HTTP e os campos recusados, para a tela tratar cada caso
export class ErroApi extends Error {
  status: number;
  campos: Record<string, string>;

  constructor(mensagem: string, status: number, campos: Record<string, string> = {}) {
    super(mensagem);
    this.status = status;
    this.campos = campos;
  }
}

// Mensagem para a pessoa, por código de resposta
const MENSAGENS: Record<number, string> = {
  0: 'Sem conexão com o servidor. Verifique a internet e tente de novo.',
  400: 'O servidor recusou os dados enviados.',
  404: 'Não encontramos esse produto.',
  500: 'O servidor teve um problema. Tente de novo em instantes.',
};

// ---------- Memória do navegador ----------

function lerLista<T>(chave: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const salvos = localStorage.getItem(chave);
    return salvos ? JSON.parse(salvos) : [];
  } catch {
    return [];
  }
}

function gravarLista<T>(chave: string, lista: T[]) {
  try {
    localStorage.setItem(chave, JSON.stringify(lista));
  } catch (err) {
    console.error('Erro ao salvar no navegador:', err);
  }
}

const produtosLocais = () => lerLista<Produto>(STORAGE_KEY);
const idsExcluidos = () => lerLista<number>(EXCLUIDOS_KEY);

// ---------- Comunicação com a API ----------

// Faz a requisição, registra no console e no painel, e transforma erro em ErroApi
async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const metodo = opcoes.method ?? 'GET';
  const endereco = `${API_URL}${caminho}`;
  const inicio = performance.now();
  const tempo = () => Math.round(performance.now() - inicio);

  let resposta: Response;
  try {
    resposta = await fetch(endereco, { cache: 'no-store', ...opcoes });
  } catch {
    registrar({ metodo, caminho: endereco, status: 0, duracaoMs: tempo(), mensagem: MENSAGENS[0] });
    throw new ErroApi(MENSAGENS[0], 0);
  }

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const campos: Record<string, string> = dados.campos ?? {};
    const mensagem = dados.erro || MENSAGENS[resposta.status] || (resposta.status >= 500 ? MENSAGENS[500] : descreverStatus(resposta.status));
    registrar({ metodo, caminho: endereco, status: resposta.status, duracaoMs: tempo(), mensagem });
    throw new ErroApi(mensagem, resposta.status, campos);
  }

  registrar({ metodo, caminho: endereco, status: resposta.status, duracaoMs: tempo(), mensagem: descreverStatus(resposta.status) });
  return dados as T;
}

// 1. GET /api/produtos: lista do servidor + o que este navegador cadastrou, sem os excluídos
export async function buscarProdutos(): Promise<Produto[]> {
  const { produtos } = await requisitar<{ produtos: Produto[] }>('');
  const excluidos = idsExcluidos();
  const locais = produtosLocais();
  const idsLocais = new Set(locais.map((p) => p.id));

  return [
    ...locais.map((p) => ({ ...p, origem: 'local' as const })),
    ...produtos.filter((p) => !idsLocais.has(p.id) && !excluidos.includes(p.id)).map((p) => ({ ...p, origem: 'api' as const })),
  ];
}

// 2. GET /api/produtos/:id
export async function buscarProdutoPorId(id: string | number): Promise<Produto> {
  const local = produtosLocais().find((p) => String(p.id) === String(id));
  if (local) return { ...local, origem: 'local' };
  if (idsExcluidos().includes(Number(id))) throw new Error('Este produto foi excluído.');

  const { produto } = await requisitar<{ produto: Produto }>(`/${id}`);
  return { ...produto, origem: 'api' };
}

// 3. POST /api/produtos: o servidor valida de novo e devolve o produto com o código gerado
export async function cadastrarProduto(novoItem: {
  title: string;
  price: number;
  category: string;
  thumbnail: string;
  description: string;
}): Promise<Produto> {
  const { produto } = await requisitar<{ produto: Produto }>('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novoItem),
  });
  gravarLista(STORAGE_KEY, [produto, ...produtosLocais()]);
  return { ...produto, origem: 'local' };
}

// 4. DELETE /api/produtos/:id
export async function excluirProduto(id: number | string) {
  const local = produtosLocais().some((p) => String(p.id) === String(id));
  try {
    await requisitar(`/${id}`, { method: 'DELETE' });
  } catch (erro) {
    // 404 de um produto cadastrado aqui = o servidor reiniciou e já não o tem; a exclusão vale mesmo assim
    if (!(erro instanceof ErroApi && erro.status === 404 && local)) throw erro;
  }

  gravarLista(STORAGE_KEY, produtosLocais().filter((p) => String(p.id) !== String(id)));
  gravarLista(EXCLUIDOS_KEY, [...idsExcluidos(), Number(id)]);
  return { id, sucesso: true };
}

// Compatibilidade
export const listarItens = buscarProdutos;
export const obterItemPorId = buscarProdutoPorId;
export const criarItem = cadastrarProduto;
export const excluirItem = excluirProduto;
