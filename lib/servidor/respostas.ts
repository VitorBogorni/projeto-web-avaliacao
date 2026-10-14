// ==========================================================================
// BACK-END · Ajudantes das rotas da API: respostas JSON padronizadas,
// leitura do corpo da requisição e log de cada requisição no servidor.
// ==========================================================================
const SEM_CACHE = { 'Cache-Control': 'no-store' };

// Envolve uma rota e escreve no log do servidor: método, caminho, código e tempo
export function comLog<Contexto>(rota: (requisicao: Request, contexto: Contexto) => Promise<Response>) {
  return async (requisicao: Request, contexto: Contexto) => {
    const inicio = Date.now();
    const resposta = await rota(requisicao, contexto);
    const caminho = new URL(requisicao.url).pathname;
    console.log(`[API] ${requisicao.method} ${caminho} -> ${resposta.status} (${Date.now() - inicio} ms)`);
    return resposta;
  };
}

export function ok(dados: unknown, status = 200, cabecalhos: Record<string, string> = {}) {
  return Response.json(dados, { status, headers: { ...SEM_CACHE, ...cabecalhos } });
}

export function erro(status: number, mensagem: string, campos?: Record<string, string | undefined>) {
  return Response.json(campos ? { erro: mensagem, campos } : { erro: mensagem }, { status, headers: SEM_CACHE });
}

// Lê o corpo JSON; devolve null se não for um objeto JSON válido
export async function lerCorpo(requisicao: Request): Promise<Record<string, unknown> | null> {
  try {
    const corpo = await requisicao.json();
    return corpo && typeof corpo === 'object' && !Array.isArray(corpo) ? corpo : null;
  } catch {
    return null;
  }
}

// Códigos de produto são números inteiros positivos
export function lerId(texto: string) {
  return /^\d{1,15}$/.test(texto) ? Number(texto) : null;
}
