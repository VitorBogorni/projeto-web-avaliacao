# Catálogo de Produtos & Imagens - Consumo de API REST Pública

Aplicação Web simples e responsiva desenvolvida em **Next.js**, **React** e **CSS**, consumindo a **API REST pública gratuita da [DummyJSON](https://dummyjson.com/docs/products)** para exibição e gerenciamento de produtos com fotos.

> **Disciplina:** Desenvolvimento Web (Avaliação 2)  
> **Professor:** Lori Ronaldo Flores Machado Filho  

---

## 👥 Integrantes do Grupo

| Integrante | Função / Responsabilidade |
| :--- | :--- |
| **Vitor Bogorni** | Estruturação da aplicação, navegação e integração com a API pública (GET, POST, DELETE) |
| **Lucas Smaniotto** | Desenvolvimento visual das telas e responsividade desktop e mobile |
| **Dieisson Cardoso** | Validações do formulário e manipulação de dados dos endpoints |
| **Régis Balz** | Componentes reutilizáveis (Cards, Modal, Navbar) e acessibilidade (WCAG AA) |

---

## 📋 Atendimento aos Requisitos Mínimos da Avaliação

| Requisito Mínimo | Como foi implementado |
| :--- | :--- |
| **3 telas (Desktop e Mobile)** | 1. **Início (`/`)**: Lista de produtos em cards com fotos e filtros.<br>2. **Novo (`/novo`)**: Formulário de cadastro com validação.<br>3. **Detalhes (`/clientes/[id]`)**: Ficha completa com foto grande, preço e exclusão. |
| **2 componentes reutilizáveis** | `Navbar` (menu responsivo), `ItemCard` (card de produto com foto) e `Modal` (janela de confirmação). |
| **3 interações do usuário** | 1. Busca em tempo real por nome.<br>2. Filtro por categoria (dropdown select).<br>3. Modal de confirmação para exclusão.<br>4. Menu mobile responsivo. |
| **1 formulário com 5 ou mais campos e validação** | Formulário em `/novo` com **5 campos obrigatórios**: Título, Categoria, Preço, URL da Imagem e Descrição, com exibição de mensagens de erro claras em caso de campos vazios ou inválidos. |
| **Consumir API REST (GET + POST + DELETE)** | Consumo da API pública oficial do **DummyJSON**:<br>- `GET https://dummyjson.com/products` (busca produtos com fotos)<br>- `GET https://dummyjson.com/products/[id]` (detalhes do produto)<br>- `POST https://dummyjson.com/products/add` (cadastro com foto)<br>- `DELETE https://dummyjson.com/products/[id]` (exclusão) |
| **Acessibilidade (WCAG AA / Lighthouse > 90)** | Rótulos `<label htmlFor>` para todos os inputs, contraste de cores nítido, link de pular para o conteúdo principal, tags semânticas e textos alternativos (`alt`) em todas as imagens. |
| **Publicação na Vercel** | Projeto pronto para deploy na Vercel com build validado via Next.js. |

---

## 🚀 Como Executar o Projeto Localmente

1. Abra o terminal na pasta do projeto:
   ```bash
   cd projeto-web-avaliacao
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse no navegador:
   ```text
   http://localhost:3000
   ```

5. Para validar o build de produção:
   ```bash
   npm run build
   ```
