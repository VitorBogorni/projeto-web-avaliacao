'use client';

// ==========================================================================
// TELA 3 · Detalhes (/produtos/:id): um produto pelo código.
// Faz GET do produto; se não existir mostra a mensagem do 404.
// Tem os botões Editar (vai para /produtos/:id/editar) e Excluir (DELETE).
// ==========================================================================
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, ImageOff, Pencil, SearchX, Star, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import ToastContainer from '@/components/Toast';
import { buscarProdutoPorId, excluirProduto } from '@/lib/api';
import { formatarNota, formatarPreco, nomeCategoria } from '@/lib/formatar';
import { guardarAviso, pegarAviso, useToasts } from '@/lib/useToasts';
import { Produto } from '@/types/item';

export default function DetalhesProdutoPage() {
  const { id } = useParams<{ id: string }>();
  // Só aceita código numérico, para não mandar qualquer coisa para a API
  const idValido = /^\d+$/.test(String(id));
  const router = useRouter();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(idValido);
  const [erro, setErro] = useState(idValido ? '' : 'O código do produto é inválido.');
  const [imagemQuebrada, setImagemQuebrada] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const { toasts, mostrar, remover } = useToasts();

  // GET por ID
  useEffect(() => {
    if (!idValido) return;
    let ativo = true;
    buscarProdutoPorId(id)
      .then((dados) => {
        if (!ativo) return;
        setProduto(dados);
        // Aviso deixado pela edição ("Alterações salvas")
        const aviso = pegarAviso();
        if (aviso) mostrar(aviso);
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
  }, [id, idValido, mostrar]);

  // DELETE
  async function confirmarExclusao() {
    if (!produto) return;
    setExcluindo(true);
    try {
      await excluirProduto(produto.id);
      guardarAviso(`"${produto.title}" foi excluído.`);
      router.push('/');
    } catch (e) {
      mostrar(e instanceof Error ? e.message : 'Não foi possível excluir. Tente de novo.', 'erro');
      setExcluindo(false);
      setConfirmando(false);
    }
  }

  if (carregando) {
    return (
      <div className="detalhes" aria-busy="true" aria-label="Carregando produto">
        <div className="painel detalhes-midia esqueleto" />
        <div className="detalhes-info">
          <div className="esqueleto" style={{ width: '30%', height: '1.6rem' }} />
          <div className="esqueleto" style={{ width: '85%', height: '2.4rem' }} />
          <div className="esqueleto" style={{ width: '40%', height: '2.2rem' }} />
          <div className="esqueleto" style={{ width: '100%', height: '6rem' }} />
        </div>
      </div>
    );
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
          <li>{nomeCategoria(produto.category)}</li>
          <li aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li aria-current="page">{produto.title}</li>
        </ol>
      </nav>

      <div className="detalhes">
        <div className="painel detalhes-midia">
          {produto.thumbnail && !imagemQuebrada ? (
            // eslint-disable-next-line @next/next/no-img-element -- imagens de qualquer link informado pelo usuário
            <img src={produto.thumbnail} alt={produto.title} onError={() => setImagemQuebrada(true)} />
          ) : (
            <div className="imagem-vazia">
              <ImageOff size={40} aria-hidden="true" />
              <span>Sem imagem</span>
            </div>
          )}
        </div>

        <div className="detalhes-info">
          <div className="detalhes-selos">
            <span className="selo">{nomeCategoria(produto.category)}</span>
          </div>

          <h1 className="detalhes-titulo">{produto.title}</h1>

          {typeof produto.rating === 'number' && (
            <span className="nota" aria-label={`Nota ${formatarNota(produto.rating)} de 5`}>
              <Star size={16} fill="currentColor" aria-hidden="true" />
              {formatarNota(produto.rating)} de 5
            </span>
          )}

          <p className="detalhes-preco">{formatarPreco(produto.price)}</p>

          <p className="detalhes-descricao">{produto.description}</p>

          <dl className="ficha">
            <dt>Código</dt>
            <dd>{produto.id}</dd>
            <dt>Categoria</dt>
            <dd>{nomeCategoria(produto.category)}</dd>
          </dl>

          <div className="detalhes-acoes">
            <Link href="/" className="botao botao-secundario">
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar
            </Link>
            <Link href={`/produtos/${produto.id}/editar`} className="botao botao-primario">
              <Pencil size={18} aria-hidden="true" />
              Editar
            </Link>
            <button type="button" className="botao botao-perigo-contorno" onClick={() => setConfirmando(true)}>
              <Trash2 size={18} aria-hidden="true" />
              Excluir produto
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={confirmando}
        onClose={() => !excluindo && setConfirmando(false)}
        onConfirm={confirmarExclusao}
        title="Excluir produto?"
        carregando={excluindo}
      >
        <p>
          <strong>{produto.title}</strong> vai sair do catálogo. Essa ação não pode ser desfeita.
        </p>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={remover} />
    </>
  );
}
