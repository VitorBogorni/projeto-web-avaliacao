// ==========================================================================
// BACK-END · Rota /api/sessao
//   GET → diz quem está logado (o menu do topo usa para mostrar o nome)
// ==========================================================================
import { cookies } from 'next/headers';
import { COOKIE_SESSAO, lerToken } from '@/lib/servidor/sessao';
import { comLog, erro, ok } from '@/lib/servidor/respostas';

export const GET = comLog(async () => {
  const usuario = lerToken((await cookies()).get(COOKIE_SESSAO)?.value);
  if (!usuario) return erro(401, 'Faça login para continuar.');
  return ok({ usuario });
});
