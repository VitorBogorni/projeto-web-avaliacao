// ==========================================================================
// FRONT · Log das requisições à API no console do navegador (F12).
// Cada chamada vira uma linha: método, endereço, código de resposta e tempo.
// ==========================================================================

export interface Registro {
  metodo: string;
  caminho: string;
  // 0 = sem resposta (sem conexão)
  status: number;
  duracaoMs: number;
  mensagem: string;
}

// Texto de cada código HTTP, para o log e para as mensagens de erro
export function descreverStatus(status: number) {
  if (status === 0) return 'Sem conexão';
  if (status === 200) return 'OK';
  if (status === 201) return 'Criado';
  if (status === 400) return 'Dados inválidos';
  if (status === 401) return 'Não autorizado';
  if (status === 404) return 'Não encontrado';
  if (status === 409) return 'Em uso';
  if (status >= 500) return 'Erro no servidor';
  return status < 400 ? 'Sucesso' : 'Erro';
}

// Sucesso em verde, erro de dados (4xx) em amarelo, falha (5xx ou sem conexão) em vermelho
export function registrar(r: Registro) {
  const linha = `[API] ${r.metodo} ${r.caminho} → ${r.status || 'sem resposta'} ${descreverStatus(r.status)} (${r.duracaoMs} ms)`;
  if (r.status === 0 || r.status >= 500) console.error(linha, r.mensagem);
  else if (r.status >= 400) console.warn(linha, r.mensagem);
  else console.info(`%c${linha}`, 'color:#067647;font-weight:600');
}
