// ==========================================================================
// FRONT · Registro das requisições à API (lado do navegador).
// Cada chamada vira uma linha no console (F12) e no painel "Requisições".
// ==========================================================================

export interface Registro {
  id: string;
  horario: string;
  metodo: string;
  caminho: string;
  // 0 = sem resposta (sem conexão)
  status: number;
  duracaoMs: number;
  mensagem: string;
}

const CHAVE = 'registro_requisicoes';
const MAXIMO = 50;
const VAZIO: Registro[] = [];

let registros: Registro[] = VAZIO;
let carregado = false;
const ouvintes = new Set<() => void>();

// Texto de cada código HTTP, para o painel e para as mensagens de erro
export function descreverStatus(status: number) {
  if (status === 0) return 'Sem conexão';
  if (status === 200) return 'OK';
  if (status === 201) return 'Criado';
  if (status === 400) return 'Dados inválidos';
  if (status === 404) return 'Não encontrado';
  if (status >= 500) return 'Erro no servidor';
  return status < 400 ? 'Sucesso' : 'Erro';
}

function carregar() {
  if (carregado || typeof window === 'undefined') return;
  carregado = true;
  try {
    const salvos = sessionStorage.getItem(CHAVE);
    if (salvos) registros = JSON.parse(salvos);
  } catch {}
}

function salvarEAvisar() {
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(registros));
  } catch {}
  ouvintes.forEach((ouvinte) => ouvinte());
}

function escreverNoConsole(r: Registro) {
  const linha = `[API] ${r.metodo} ${r.caminho} → ${r.status || 'sem resposta'} ${descreverStatus(r.status)} (${r.duracaoMs} ms)`;
  if (r.status === 0 || r.status >= 500) console.error(linha, r.mensagem);
  else if (r.status >= 400) console.warn(linha, r.mensagem);
  else console.info(`%c${linha}`, 'color:#067647;font-weight:600');
}

export function registrar(dados: Omit<Registro, 'id' | 'horario'>) {
  carregar();
  const registro: Registro = {
    ...dados,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    horario: new Date().toISOString(),
  };
  escreverNoConsole(registro);
  registros = [registro, ...registros].slice(0, MAXIMO);
  salvarEAvisar();
}

export function limparRegistros() {
  registros = VAZIO;
  salvarEAvisar();
}

// Para o useSyncExternalStore do painel
export function assinarRegistros(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

export function lerRegistros() {
  carregar();
  return registros;
}

export function lerRegistrosNoServidor() {
  return VAZIO;
}
