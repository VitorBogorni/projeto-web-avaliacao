// ==========================================================================
// BACK-END · Rota /api/produtos
//   GET  → lista os produtos (filtros opcionais ?busca= e ?categoria=)
//   POST → cadastra um produto novo
// ==========================================================================
import { criar, listar, validar } from '@/lib/servidor/catalogo';
import { comLog, erro, lerCorpo, ok } from '@/lib/servidor/respostas';

// GET /api/produtos → 200 com { produtos, total }
export const GET = comLog(async (requisicao: Request) => {
  const params = new URL(requisicao.url).searchParams;
  const produtos = listar({
    busca: params.get('busca') ?? undefined,
    categoria: params.get('categoria') ?? undefined,
  });
  return ok({ produtos, total: produtos.length });
});

// POST /api/produtos → 201 com { produto } ou 400 com os erros de cada campo
export const POST = comLog(async (requisicao: Request) => {
  const corpo = await lerCorpo(requisicao);
  if (!corpo) return erro(400, 'Envie os dados do produto em JSON.');

  const erros = validar(corpo);
  if (Object.keys(erros).length > 0) return erro(400, 'Dados inválidos.', erros);

  const produto = criar(corpo);
  return ok({ produto }, 201, { Location: `/api/produtos/${produto.id}` });
});
