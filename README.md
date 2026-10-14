# Catálogo de Produtos

Trabalho da Avaliação 2 de Desenvolvimento Web, com o professor Lori Ronaldo Flores Machado Filho.

É um site em Next.js para cadastrar, listar e excluir produtos usando a API pública da DummyJSON (https://dummyjson.com/docs/products).

## Grupo

- Vitor Bogorni: estrutura do projeto, layout e integração com a API
- Lucas Smaniotto: visual das telas e responsividade
- Dieisson Cardoso: validação do formulário e rotas de dados
- Régis Balz: componentes reutilizáveis e acessibilidade

## Telas

- Início (`/`): lista os produtos em cards, com busca pelo nome, filtro por categoria e botão de excluir. Antes de excluir abre uma janela pedindo confirmação.
- Novo produto (`/novo`): formulário com título, categoria, preço, link da imagem e descrição. Todos os campos são obrigatórios e mostram mensagem de erro quando estão vazios ou inválidos.
- Detalhes (`/clientes/[id]`): mostra a foto grande, o preço, a descrição e permite excluir o produto.

No celular, o menu vira um botão e os cards e a tela de detalhes ficam em uma coluna.

## API

As chamadas ficam em `lib/api.ts`:

- GET `https://dummyjson.com/products`
- GET `https://dummyjson.com/products/{id}`
- POST `https://dummyjson.com/products/add`
- DELETE `https://dummyjson.com/products/{id}`

A DummyJSON responde ao POST e ao DELETE, mas não grava nada de verdade. Por isso a lista guarda no navegador (localStorage) os produtos cadastrados, assim eles continuam aparecendo depois de recarregar a página.

## Acessibilidade

- todo campo tem `label` ligado ao input
- link "Pular para o conteúdo principal" no topo
- imagens com texto alternativo
- mensagens de erro lidas pelo leitor de tela (`role="alert"`)
- botões só com ícone ou texto curto têm `aria-label`

## Como rodar

Precisa do Node.js instalado.

```bash
npm install
npm run dev
```

Depois é só abrir http://localhost:3000.

Para testar o build de produção:

```bash
npm run build
```

## Tecnologias

Next.js 16, React 19, TypeScript e CSS puro (`app/globals.css`).
