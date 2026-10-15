# Catálogo de Produtos

Trabalho da Avaliação 2 de Desenvolvimento Web, com o professor Lori Ronaldo Flores Machado Filho.

**Objetivo:** organizar o catálogo de produtos de uma loja. Depois de entrar com e-mail e senha, a pessoa cadastra, consulta e remove produtos com preço, categoria e foto, e organiza as categorias, pelo computador ou pelo celular.

O projeto tem **front-end e back-end próprios**: as telas (front-end) conversam com uma API REST feita no próprio Next.js (back-end), em `app/api`.

## Grupo

- Vitor Bogorni: estrutura do projeto, layout e integração com a API
- Lucas Smaniotto: visual das telas e responsividade
- Dieisson Cardoso: validação do formulário e rotas de dados
- Régis Balz: componentes reutilizáveis e acessibilidade

## Como acessar

O sistema pede login. O e-mail e a senha ficam nas variáveis de ambiente (veja abaixo) e não aparecem no repositório. Os dados de acesso da versão publicada são enviados junto com o link do site.

## Como funciona

Cada tela chama uma função de `lib/api.ts`, que faz a requisição HTTP para a API em `app/api`. A rota valida os dados, guarda na memória do servidor e responde em JSON. A tela mostra o resultado ou a mensagem de erro.

## Mapa do projeto

| Pasta / arquivo | O que é | Lado |
|---|---|---|
| `app/login/page.tsx` | Tela de login: e-mail e senha validados | Front |
| `proxy.ts` | Protege as páginas: sem login vai para `/login`; a API responde 401 | Back |
| `app/categorias/page.tsx` | Tela de categorias: cadastrar e excluir categorias | Front |
| `app/page.tsx` | Tela 1 · Início: lista, busca, filtro por categoria, ordenação, excluir | Front |
| `app/novo/page.tsx` | Tela 2 · Novo produto: formulário com 5 campos validados | Front |
| `app/produtos/[id]/page.tsx` | Tela 3 · Detalhes de um produto (botões Editar e Excluir) | Front |
| `app/produtos/[id]/editar/page.tsx` | Editar produto: mesmo formulário, salva com PATCH | Front |
| `app/layout.tsx` | Moldura de todas as páginas (menu do topo) | Front |
| `app/globals.css` | Todo o visual (cores, botões, cards, celular) | Front |
| `components/` | Peças reutilizáveis: `Navbar`, `ItemCard`, `Modal`, `FormField`, `FormularioProduto`, `Toast` | Front |
| `.env.example` | Lista das variáveis de ambiente (sem os valores) | Config |
| `lib/api.ts` | Front falando com o back: as 4 chamadas HTTP e o tratamento dos erros | Front |
| `lib/validacao.ts` | Regras de cada campo (usadas na tela e no servidor) | Front e back |
| `lib/registro.ts` | Log de cada requisição no console do navegador (F12) | Front |
| `app/api/produtos/route.ts` | Rota GET e POST `/api/produtos` | Back |
| `app/api/produtos/[id]/route.ts` | Rota GET, PATCH e DELETE `/api/produtos/:id` | Back |
| `app/api/categorias/` | Rotas GET, POST `/api/categorias` e DELETE `/api/categorias/:id` | Back |
| `app/api/login/`, `logout/`, `sessao/` | Rotas de login: entrar, sair e quem está logado | Back |
| `app/api/route.ts` | `/api`: lista as rotas da API | Back |
| `lib/servidor/` | Listas em memória (produtos e categorias), sessão (login) e respostas padronizadas | Back |
| `types/` | Formato dos dados (produto, formulário, aviso) | Os dois |

## Telas

- **Login (`/login`)**: e-mail e senha obrigatórios, com mensagem de erro em cada campo e aviso de e-mail ou senha incorretos. Mostrar/esconder senha.
- **Início (`/`)**: mostra os produtos em cards (o catálogo já começa com 2 produtos de exemplo). Tem busca pelo nome, filtro por categoria, ordenação por preço ou nome, botão Atualizar e excluir com confirmação.
- **Novo produto (`/novo`)**: título, categoria, preço, link da imagem e descrição. Todos obrigatórios, com mensagem de erro em cada campo e pré-visualização do card ao lado.
- **Categorias (`/categorias`)**: cadastrar categoria (nome obrigatório, sem repetir) e excluir. Categoria com produtos não pode ser excluída.
- **Detalhes (`/produtos/:id`)**: foto grande, preço, descrição e código. Botões Editar e Excluir.
- **Editar (`/produtos/:id/editar`)**: o mesmo formulário do cadastro, já preenchido.

No celular o menu vira um botão e tudo fica em uma coluna.

## API própria

| Método | Rota | Resposta |
|---|---|---|
| GET | `/api/produtos` | 200 com a lista (filtros `?busca=` e `?categoria=`) |
| POST | `/api/produtos` | 201 com o produto criado, ou 400 com o erro de cada campo |
| GET | `/api/produtos/:id` | 200 com o produto, ou 404 |
| PATCH | `/api/produtos/:id` | 200 com o produto alterado, 400 ou 404 |
| DELETE | `/api/produtos/:id` | 200, ou 404 |
| GET | `/api/categorias` | 200 com a lista de categorias |
| POST | `/api/categorias` | 201 com a categoria criada, ou 400 (nome vazio, curto, longo ou repetido) |
| DELETE | `/api/categorias/:id` | 200, 404, ou 409 se algum produto usa a categoria |
| POST | `/api/login` | 200 e grava o cookie de sessão, 400 ou 401 (e-mail ou senha incorretos) |
| POST | `/api/logout` | 200 e apaga o cookie |
| GET | `/api/sessao` | 200 com o usuário logado, ou 401 |

As rotas de produtos e categorias só respondem com login (sem sessão: 401).

As telas usam GET, POST, PATCH (editar) e DELETE.

**Sem banco de dados (retorno mockado, como o enunciado permite):** o servidor guarda os produtos na memória. Na Vercel essa memória zera quando o servidor reinicia, então o navegador também lembra o que foi cadastrado e excluído (`localStorage`) e junta as duas listas.

**Tratamento de respostas e erros (front):** cada código vira uma mensagem para a pessoa: 400 (dados inválidos, mostrados no campo certo), 404 (não encontrado), 500 (erro no servidor) e sem conexão. Toda requisição aparece no console do navegador (F12) com método, endereço, código e tempo. No servidor, cada requisição gera uma linha de log (`[API] POST /api/produtos -> 201`).

## Acessibilidade

- todo campo tem `label`, texto de ajuda e erro ligados ao campo (`aria-describedby`, `aria-invalid`)
- link "Pular para o conteúdo principal" no topo
- imagens com texto alternativo; ícones decorativos escondidos do leitor de tela
- erros e avisos lidos pelo leitor de tela (`role="alert"`, `aria-live`)
- botões só com ícone têm `aria-label`; menu e filtros informam o estado (`aria-expanded`, `aria-pressed`, `aria-current`)
- modal com foco no "Cancelar", fecha com Esc
- respeita "reduzir movimento" do sistema

## Variáveis de ambiente

Os valores secretos não ficam no código. Os nomes estão em `.env.example`:

- `SESSAO_SEGREDO`: segredo que assina o cookie de sessão
- `ADMIN_NOME`, `ADMIN_EMAIL`, `ADMIN_SENHA`: usuário que entra no sistema

No computador, os valores ficam em `.env.local` (fora do Git). Na Vercel, em **Settings › Environment Variables**.

## Como rodar

Precisa do Node.js instalado. Copie `.env.example` para `.env.local` e preencha os valores.

```bash
npm install
npm run dev
```

Depois é só abrir http://localhost:3000.

Para testar o build de produção:

```bash
npm run build
npm start
```

## Linguagens e tecnologias

- **TypeScript**: todo o código (telas, componentes e API). É JavaScript com tipos.
- **TSX/JSX**: o HTML das telas escrito dentro do TypeScript (React).
- **CSS**: todo o visual, em `app/globals.css`.
- **JSON**: formato dos dados trocados entre front-end e back-end.
- **Next.js 16**: telas e rotas de API no mesmo projeto. **React 19**: componentes da tela. **lucide-react**: ícones.

## Melhorias futuras

- Banco de dados de verdade (por exemplo PostgreSQL com Prisma), para os dados ficarem salvos para todos.
- Cadastro de usuários com perfis (administrador e vendedor) e troca de senha.
- Envio da foto do produto pelo computador, em vez de colar um link.
- Controle de estoque, com aviso de produto acabando.
- Relatórios e exportação da lista para planilha.
- Testes automáticos das telas e da API.
