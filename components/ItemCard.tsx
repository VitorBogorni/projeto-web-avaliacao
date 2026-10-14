'use client';

import Link from 'next/link';
import { Produto } from '@/types/item';

interface ItemCardProps {
  item: Produto;
  onExcluir: (item: Produto) => void;
}

export default function ItemCard({ item, onExcluir }: ItemCardProps) {
  return (
    <article className="card-item">
      <div className="card-image-box">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="card-image"
          loading="lazy"
        />
        <span className="card-badge">{item.category}</span>
      </div>

      <div className="card-content">
        <h3 className="card-title">{item.title}</h3>
        <p className="card-desc">{item.description}</p>
        <p className="card-price">R$ {Number(item.price).toFixed(2)}</p>
      </div>

      <div className="card-actions">
        <button
          type="button"
          onClick={() => onExcluir(item)}
          className="btn-danger-sm"
          aria-label={`Excluir ${item.title}`}
        >
          Excluir
        </button>

        <Link
          href={`/clientes/${item.id}`}
          className="btn-primary-sm"
        >
          Ver Detalhes
        </Link>
      </div>
    </article>
  );
}
