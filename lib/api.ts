// ==========================================================================
// FRONT · Comunicação com a API. As telas chamam estas funções e nunca o fetch direto.
// Produtos: GET /api/produtos, GET /api/produtos/:id, POST /api/produtos, DELETE /api/produtos/:id.
// Categorias: GET /api/categorias, POST /api/categorias, DELETE /api/categorias/:id.
// Login: POST /api/login, POST /api/logout, GET /api/sessao.
// Cada requisição é registrada (console + painel) e todo erro vira ErroApi com o código HTTP.
// ==========================================================================
import { Categoria, Produto } from '@/types/item';
import { descreverStatus, registrar } from '@/lib/registro';

// API própria do projeto (rotas em app/api)
const API_URL = '/api';

// O servidor guarda os dados em memória, que zera quando ele reinicia (ex.: na Vercel).
// Por isso o navegador também lembra o que cadastrou e o que excluiu.
const STORAGE_KEY = 'produtos_adicionados_usuario';
const EXCLUIDOS_KEY = 'produtos_excluidos';
const CATEGORIAS_KEY = 'categorias_adicionadas';
const CATEGORIAS_EXCLUIDAS_KEY = 'categorias_excluidas';

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
  401: 'Sua sessão terminou. Entre de novo.',
  404: 'Não encontramos esse item.',
  409: 'Não foi possível concluir: o item está em uso.',
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

    // 401 fora do login = a sessão acabou: volta para a tela de login
    if (resposta.status === 401 && !caminho.startsWith('/login') && !caminho.startsWith('/sessao')) {
      const voltar = window.location.pathname + window.location.search;
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- função fora de componente (sem useRouter)
      window.location.href = `/login?voltar=${encodeURIComponent(voltar)}`;
    }
    throw new ErroApi(mensagem, resposta.status, campos);
  }

  registrar({ metodo, caminho: endereco, status: resposta.status, duracaoMs: tempo(), mensagem: descreverStatus(resposta.status) });
  return dados as T;
}

// 1. GET /api/produtos: lista do servidor + o que este navegador cadastrou, sem os excluídos
export async function buscarProdutos(): Promise<Produto[]> {
  const { produtos } = await requisitar<{ produtos: Produto[] }>('/produtos');
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

  const { produto } = await requisitar<{ produto: Produto }>(`/produtos/${id}`);
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
  const { produto } = await requisitar<{ produto: Produto }>('/produtos', {
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
    await requisitar(`/produtos/${id}`, { method: 'DELETE' });
  } catch (erro) {
    // 404 de um produto cadastrado aqui = o servidor reiniciou e já não o tem; a exclusão vale mesmo assim
    if (!(erro instanceof ErroApi && erro.status === 404 && local)) throw erro;
  }

  gravarLista(STORAGE_KEY, produtosLocais().filter((p) => String(p.id) !== String(id)));
  gravarLista(EXCLUIDOS_KEY, [...idsExcluidos(), Number(id)]);
  return { id, sucesso: true };
}

// ---------- Categorias ----------

const categoriasLocais = () => lerLista<Categoria>(CATEGORIAS_KEY);
const categoriasExcluidas = () => lerLista<string>(CATEGORIAS_EXCLUIDAS_KEY);

// GET /api/categorias: as do servidor + as criadas neste navegador, sem as excluídas
export async function buscarCategorias(): Promise<Categoria[]> {
  const { categorias } = await requisitar<{ categorias: Categoria[] }>('/categorias');
  const excluidas = categoriasExcluidas();
  const doServidor = categorias.filter((c) => !excluidas.includes(c.id)).map((c) => ({ ...c, origem: 'api' as const }));
  const ids = new Set(doServidor.map((c) => c.id));
  const locais = categoriasLocais()
    .filter((c) => !ids.has(c.id) && !excluidas.includes(c.id))
    .map((c) => ({ ...c, origem: 'local' as const }));
  return [...doServidor, ...locais].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

// POST /api/categorias
export async function cadastrarCategoria(nome: string): Promise<Categoria> {
  const { categoria } = await requisitar<{ categoria: Categoria }>('/categorias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });
  gravarLista(CATEGORIAS_KEY, [...categoriasLocais().filter((c) => c.id !== categoria.id), categoria]);
  gravarLista(CATEGORIAS_EXCLUIDAS_KEY, categoriasExcluidas().filter((id) => id !== categoria.id));
  return { ...categoria, origem: 'local' };
}

// DELETE /api/categorias/:id (409 = ainda tem produtos usando)
export async function excluirCategoria(id: string) {
  const local = categoriasLocais().some((c) => c.id === id);
  try {
    await requisitar(`/categorias/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (erro) {
    if (!(erro instanceof ErroApi && erro.status === 404 && local)) throw erro;
  }
  gravarLista(CATEGORIAS_KEY, categoriasLocais().filter((c) => c.id !== id));
  gravarLista(CATEGORIAS_EXCLUIDAS_KEY, [...categoriasExcluidas(), id]);
  return { id, sucesso: true };
}

// ---------- Login ----------

export interface Usuario {
  nome: string;
  email: string;
}

// POST /api/login: o servidor confere e grava o cookie de sessão
export async function entrar(email: string, senha: string) {
  const { usuario } = await requisitar<{ usuario: Usuario }>('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  return usuario;
}

// POST /api/logout: apaga o cookie de sessão
export async function sair() {
  await requisitar('/logout', { method: 'POST' });
}

// GET /api/sessao: quem está logado (ou null)
export async function sessaoAtual(): Promise<Usuario | null> {
  try {
    const { usuario } = await requisitar<{ usuario: Usuario }>('/sessao');
    return usuario;
  } catch {
    return null;
  }
}

// Compatibilidade
export const listarItens = buscarProdutos;
export const obterItemPorId = buscarProdutoPorId;
export const criarItem = cadastrarProduto;
export const excluirItem = excluirProduto;
