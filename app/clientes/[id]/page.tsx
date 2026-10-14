'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Produto } from '@/types/item';
import { buscarProdutoPorId, excluirProduto } from '@/lib/api';

interface PageProps {
  params: Promise<{ id: string }>;
}

function DetalhesConteudo({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Chamada GET por ID
  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        const dados = await buscarProdutoPorId(id);
        setProduto(dados);
      } catch {
        setErro('Não foi possível carregar os dados deste produto.');
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [id]);

  // Chamada DELETE
  async function handleExcluir() {
    if (!produto) return;

    const confirmou = window.confirm(`Deseja realmente excluir o produto "${produto.title}"?`);
    if (!confirmou) return;

    try {
      await excluirProduto(produto.id);
      alert('Produto excluído com sucesso via API pública (DELETE)!');
      router.push('/');
    } catch {
      alert('Erro ao excluir produto.');
    }
  }

  if (carregando) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p>Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (erro || !produto) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2>Produto não encontrado</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>{erro}</p>
        <Link href="/" className="btn-primario">
          Voltar para o Início
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '850px' }}>
      <Link href="/" className="link-voltar">
        Voltar para o Início
      </Link>

      <article className="cartao-detalhes">
        <div className="detalhes-grid">
          {/* Foto Principal */}
          <div className="detalhes-foto-box">
            <img
              src={produto.thumbnail}
              alt={produto.title}
              className="detalhes-foto"
            />
          </div>

          {/* Informações */}
          <div className="detalhes-info">
            <span className="card-badge" style={{ alignSelf: 'flex-start' }}>
              {produto.category}
            </span>

            <h1 className="detalhes-titulo">{produto.title}</h1>

            <p className="detalhes-preco">
              R$ {Number(produto.price).toFixed(2)}
            </p>

            <div style={{ margin: '1rem 0' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem', color: '#111' }}>
                Descrição:
              </h3>
              <p style={{ color: '#555', lineHeight: '1.6' }}>
                {produto.description}
              </p>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#777', marginTop: 'auto' }}>
              Endpoint consultado: <code>GET https://dummyjson.com/products/{produto.id}</code>
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handleExcluir}
                className="btn-perigo"
              >
                Excluir Produto (DELETE)
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function PaginaDetalhes({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="container" style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>}>
      <DetalhesConteudo params={params} />
    </Suspense>
  );
}
