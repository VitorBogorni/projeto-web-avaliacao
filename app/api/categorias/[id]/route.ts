// ==========================================================================
// BACK-END · Rota /api/categorias/:id
//   DELETE → exclui a categoria (se nenhum produto estiver usando)
// ==========================================================================
import { contarPorCategoria } from '@/lib/servidor/catalogo';
import { obterCategoria, removerCategoria } from '@/lib/servidor/categorias';
import { comLog, erro, ok } from '@/lib/servidor/respostas';

type Contexto = { params: Promise<{ id: string }> };

// DELETE /api/categorias/:id → 200, 404 (não existe) ou 409 (tem produtos usando)
export const DELETE = comLog(async (_requisicao: Request, { params }: Contexto) => {
  const { id } = await params;
  const categoria = obterCategoria(id);
  if (!categoria) return erro(404, 'Não existe categoria com esse código.');

  const emUso = contarPorCategoria(categoria.nome);
  if (emUso > 0) {
    return erro(409, `Não dá para excluir: ${emUso} ${emUso === 1 ? 'produto usa' : 'produtos usam'} esta categoria.`);
  }

  removerCategoria(id);
  return ok({ mensagem: 'Categoria excluída.', id });
});
