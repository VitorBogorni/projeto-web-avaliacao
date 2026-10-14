'use client';

// ==========================================================================
// COMPONENTE · Card de um produto (imagem, categoria, título, preço, nota).
// Usado na lista e na pré-visualização do formulário.
// ==========================================================================
import { useState } from 'react';
import Link from 'next/link';
import { ImageOff, Star, Trash2 } from 'lucide-react';
import { Produto } from '@/types/item';
import { formatarNota, formatarPreco, nomeCategoria } from '@/lib/formatar';

interface ItemCardProps {
  item: Produto;
  onExcluir?: (item: Produto) => void;
  // Sem link nem botão de excluir (usado na pré-visualização do formulário)
  apenasVisual?: boolean;
}

export default function ItemCard({ item, onExcluir, apenasVisual = false }: ItemCardProps) {
  const [imagemQuebrada, setImagemQuebrada] = useState(false);
  const mostrarImagem = item.thumbnail && !imagemQuebrada;

  const conteudo = (
    <>
      <div className="card-midia">
        {mostrarImagem ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagens de qualquer link informado pelo usuário
          <img src={item.thumbnail} alt={item.title} loading="lazy" onError={() => setImagemQuebrada(true)} />
        ) : (
          <div className="imagem-vazia">
            <ImageOff size={28} aria-hidden="true" />
            <span>Sem imagem</span>
          </div>
        )}
        <div className="selos">
          {item.category && <span className="selo">{nomeCategoria(item.category)}</span>}
          {item.origem === 'local' && <span className="selo selo-destaque">Cadastrado por você</span>}
        </div>
      </div>
      <div className="card-corpo">
        <h2 className="card-titulo">{item.title || 'Título do produto'}</h2>
        <p className="card-descricao">{item.description || 'A descrição aparece aqui.'}</p>
      </div>
    </>
  );

  return (
    <article className="card">
      {apenasVisual ? (
        <div className="card-link">{conteudo}</div>
      ) : (
        <Link href={`/produtos/${item.id}`} className="card-link">
          {conteudo}
        </Link>
      )}

      <div className="card-rodape">
        <div className="info">
          <span className="preco">{formatarPreco(item.price)}</span>
          {typeof item.rating === 'number' && (
            <span className="nota" aria-label={`Nota ${formatarNota(item.rating)} de 5`}>
              <Star size={14} fill="currentColor" aria-hidden="true" />
              {formatarNota(item.rating)}
            </span>
          )}
        </div>
        {!apenasVisual && onExcluir && (
          <button
            type="button"
            onClick={() => onExcluir(item)}
            className="botao-icone perigo"
            aria-label={`Excluir ${item.title}`}
            title="Excluir"
          >
            <Trash2 size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}
