// ==========================================================================
// BACK-END · Rota /api/logout
//   POST → apaga o cookie de sessão (sair do sistema)
// ==========================================================================
import { cookies } from 'next/headers';
import { COOKIE_SESSAO } from '@/lib/servidor/sessao';
import { comLog, ok } from '@/lib/servidor/respostas';

export const POST = comLog(async () => {
  (await cookies()).delete(COOKIE_SESSAO);
  return ok({ mensagem: 'Sessão encerrada.' });
});
