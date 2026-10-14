// ==========================================================================
// BACK-END · Rota /api/produtos/:id  (um produto pelo código)
//   GET    → detalhes do produto
//   PATCH  → altera só os campos enviados
//   DELETE → exclui o produto
// ==========================================================================
import { atualizar, obter, remover, validar } from '@/lib/servidor/catalogo';
import { comLog, erro, lerCorpo, lerId, ok } from '@/lib/servidor/respostas';

type Contexto = { params: Promise<{ id: string }> };

const NAO_ENCONTRADO = 'Não existe produto com esse código.';

// GET /api/produtos/:id → 200 com { produto } ou 404
export const GET = comLog(async (_requisicao: Request, { params }: Contexto) => {
  const id = lerId((await params).id);
  const produto = id === null ? null : obter(id);
  if (!produto) return erro(404, NAO_ENCONTRADO);
  return ok({ produto });
});

// PATCH /api/produtos/:id → 200 com { produto }, 400 (dados inválidos) ou 404
export const PATCH = comLog(async (requisicao: Request, { params }: Contexto) => {
  const id = lerId((await params).id);
  if (id === null || !obter(id)) return erro(404, NAO_ENCONTRADO);

  const corpo = await lerCorpo(requisicao);
  if (!corpo) return erro(400, 'Envie os campos a alterar em JSON.');

  const erros = validar(corpo, true);
  if (Object.keys(erros).length > 0) return erro(400, 'Dados inválidos.', erros);

  return ok({ produto: atualizar(id, corpo) });
});

// DELETE /api/produtos/:id → 200 com { mensagem, id } ou 404
export const DELETE = comLog(async (_requisicao: Request, { params }: Contexto) => {
  const id = lerId((await params).id);
  if (id === null || !remover(id)) return erro(404, NAO_ENCONTRADO);
  return ok({ mensagem: 'Produto excluído.', id });
});
