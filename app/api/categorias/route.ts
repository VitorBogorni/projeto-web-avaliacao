// ==========================================================================
// BACK-END · Rota /api/categorias
//   GET  → lista as categorias
//   POST → cadastra uma categoria nova
// ==========================================================================
import { criarCategoria, listarCategorias, nomesCategorias } from '@/lib/servidor/categorias';
import { comLog, erro, lerCorpo, ok } from '@/lib/servidor/respostas';
import { validarNomeCategoria } from '@/lib/validacao';

// GET /api/categorias → 200 com { categorias }
export const GET = comLog(async () => ok({ categorias: listarCategorias() }));

// POST /api/categorias → 201 com { categoria } ou 400 (nome vazio, curto, longo ou repetido)
export const POST = comLog(async (requisicao: Request) => {
  const corpo = await lerCorpo(requisicao);
  const nome = typeof corpo?.nome === 'string' ? corpo.nome : '';

  const problema = validarNomeCategoria(nome, nomesCategorias());
  if (problema) return erro(400, 'Dados inválidos.', { nome: problema });

  return ok({ categoria: criarCategoria(nome) }, 201);
});
