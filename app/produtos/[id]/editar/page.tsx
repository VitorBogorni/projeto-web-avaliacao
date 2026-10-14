'use client';

// ==========================================================================
// TELA · Editar produto (/produtos/:id/editar).
// Busca o produto (GET), mostra o mesmo formulário do cadastro já preenchido
// e salva as alterações com PATCH /api/produtos/:id.
// ==========================================================================
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, SearchX } from 'lucide-react';
import FormularioProduto, { DadosProduto } from '@/components/FormularioProduto';
import { atualizarProduto, buscarProdutoPorId } from '@/lib/api';
import { guardarAviso } from '@/lib/useToasts';
import { FormularioProduto as Formulario, Produto } from '@/types/item';

// Preço do produto no formato do campo: 89.9 → "89,90"
function precoParaCampo(preco: number) {
  return preco.toFixed(2).replace('.', ',');
}

export default function EditarProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const idValido = /^\d+$/.test(String(id));
  const router = useRouter();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(idValido);
  const [erro, setErro] = useState(idValido ? '' : 'O código do produto é inválido.');

  // GET do produto para preencher o formulário
  useEffect(() => {
    if (!idValido) return;
    let ativo = true;
    buscarProdutoPorId(id)
      .then((dados) => {
        if (ativo) setProduto(dados);
      })
      .catch((e: Error) => {
        if (ativo) setErro(e.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [id, idValido]);

  // PATCH ao salvar
  async function salvar(dados: DadosProduto) {
    const atualizado = await atualizarProduto(id, dados);
    guardarAviso(`Alterações em "${atualizado.title}" salvas.`);
    router.push(`/produtos/${id}`);
  }

  if (carregando) {
    return <p className="resumo">Carregando produto...</p>;
  }

  if (erro || !produto) {
    return (
      <div className="estado estado-erro" role="alert">
        <span className="estado-icone" aria-hidden="true">
          <SearchX size={26} />
        </span>
        <h1 className="titulo" style={{ fontSize: '1.4rem' }}>
          Produto não encontrado
        </h1>
        <p>{erro || 'Não foi possível carregar este produto.'}</p>
        <div className="acoes">
          <Link href="/" className="botao botao-primario">
            <ArrowLeft size={18} aria-hidden="true" />
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  const inicial: Formulario = {
    title: produto.title,
    category: produto.category,
    price: precoParaCampo(produto.price),
    thumbnail: produto.thumbnail,
    description: produto.description,
  };

  return (
    <>
      <nav className="trilha" aria-label="Você está em">
        <ol>
          <li>
            <Link href="/">Produtos</Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li>
            <Link href={`/produtos/${produto.id}`}>{produto.title}</Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li aria-current="page">Editar</li>
        </ol>
      </nav>

      <section className="cabecalho">
        <div>
          <p className="sobretitulo">Edição</p>
          <h1 className="titulo">Editar produto</h1>
          <p className="subtitulo">Altere os dados e salve. Todos os campos são obrigatórios.</p>
        </div>
      </section>

      <FormularioProduto
        inicial={inicial}
        rotulo="Edição de produto"
        textoBotao="Salvar alterações"
        cancelarHref={`/produtos/${produto.id}`}
        onSalvar={salvar}
      />
    </>
  );
}
