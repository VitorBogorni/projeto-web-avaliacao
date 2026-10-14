// ==========================================================================
// BACK-END · Rota /api  → mostra as rotas da API (bom para demonstrar)
// ==========================================================================
import { comLog, ok } from '@/lib/servidor/respostas';

export const GET = comLog(async () =>
  ok({
    nome: 'API do Catálogo de Produtos',
    rotas: [
      { metodo: 'GET', caminho: '/api/produtos', descricao: 'Lista os produtos. Filtros: ?busca= e ?categoria=' },
      { metodo: 'POST', caminho: '/api/produtos', descricao: 'Cadastra um produto (201) ou devolve os erros (400)' },
      { metodo: 'GET', caminho: '/api/produtos/:id', descricao: 'Detalhes de um produto (200) ou 404' },
      { metodo: 'PATCH', caminho: '/api/produtos/:id', descricao: 'Altera os campos enviados (200), 400 ou 404' },
      { metodo: 'DELETE', caminho: '/api/produtos/:id', descricao: 'Exclui um produto (200) ou 404' },
    ],
  })
);
