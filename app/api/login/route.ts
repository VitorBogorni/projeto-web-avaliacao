// ==========================================================================
// BACK-END · Rota /api/login
//   POST → confere e-mail e senha e grava o cookie de sessão
// ==========================================================================
import { cookies } from 'next/headers';
import { autenticar, COOKIE_SESSAO, criarToken, DURACAO_SESSAO_SEGUNDOS } from '@/lib/servidor/sessao';
import { comLog, erro, lerCorpo, ok } from '@/lib/servidor/respostas';

// POST /api/login → 200 com { usuario }, 400 (faltou dado) ou 401 (e-mail ou senha errados)
export const POST = comLog(async (requisicao: Request) => {
  const corpo = await lerCorpo(requisicao);
  const email = typeof corpo?.email === 'string' ? corpo.email : '';
  const senha = typeof corpo?.senha === 'string' ? corpo.senha : '';

  if (!email.trim() || !senha) {
    return erro(400, 'Informe o e-mail e a senha.', {
      email: email.trim() ? undefined : 'Informe o e-mail.',
      senha: senha ? undefined : 'Informe a senha.',
    });
  }

  const usuario = autenticar(email, senha);
  if (!usuario) return erro(401, 'E-mail ou senha incorretos.');

  (await cookies()).set(COOKIE_SESSAO, criarToken(usuario), {
    httpOnly: true, // o JavaScript da página não consegue ler o cookie
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' && new URL(requisicao.url).protocol === 'https:',
    path: '/',
    maxAge: DURACAO_SESSAO_SEGUNDOS,
  });
  return ok({ usuario });
});
