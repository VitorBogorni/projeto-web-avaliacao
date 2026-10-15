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
      { metodo: 'GET', caminho: '/api/categorias', descricao: 'Lista as categorias' },
      { metodo: 'POST', caminho: '/api/categorias', descricao: 'Cadastra uma categoria (201) ou devolve o erro (400)' },
      { metodo: 'DELETE', caminho: '/api/categorias/:id', descricao: 'Exclui uma categoria (200), 404 ou 409 se algum produto usa' },
      { metodo: 'POST', caminho: '/api/login', descricao: 'Entra no sistema e grava o cookie de sessão (200), 400 ou 401' },
      { metodo: 'POST', caminho: '/api/logout', descricao: 'Sai do sistema e apaga o cookie (200)' },
      { metodo: 'GET', caminho: '/api/sessao', descricao: 'Mostra quem está logado (200) ou 401' },
    ],
  })
);
