'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Produto, CATEGORIAS } from '@/types/item';
import { buscarProdutos, excluirProduto } from '@/lib/api';
import ItemCard from '@/components/ItemCard';
import Modal from '@/components/Modal';

export default function PaginaInicial() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [itemParaExcluir, setItemParaExcluir] = useState<Produto | null>(null);

  // 1. Chamada GET ao carregar a página
  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);
      const lista = await buscarProdutos();
      setProdutos(lista);
    } catch (erro) {
      console.error('Erro ao buscar dados:', erro);
    } finally {
      setCarregando(false);
    }
  }

  // 2. Filtro em tempo real (Busca e Categoria)
  const produtosFiltrados = produtos.filter((item) => {
    const combinaBusca = item.title.toLowerCase().includes(busca.toLowerCase());
    const combinaCategoria = categoria === 'todas' || item.category === categoria;
    return combinaBusca && combinaCategoria;
  });

  // 3. Chamada DELETE ao confirmar no modal
  async function confirmarExclusao() {
    if (!itemParaExcluir) return;

    try {
      await excluirProduto(itemParaExcluir.id);
      // Remove da tela após exclusão
      setProdutos(produtos.filter((p) => p.id !== itemParaExcluir.id));
      setItemParaExcluir(null);
      alert('Produto excluído com sucesso via API pública (DELETE)!');
    } catch {
      alert('Erro ao excluir produto.');
    }
  }

  return (
    <div className="container">
      {/* Cabeçalho */}
      <section className="painel-topo">
        <h1 className="titulo-pagina">Catálogo de Produtos</h1>
        <p className="subtitulo-pagina">
          Consumindo a API pública REST <code>https://dummyjson.com/products</code>.
        </p>
      </section>

      {/* Barra de Filtros e Busca (Interações com o Usuário) */}
      <section className="barra-filtros">
        <div className="campo-busca">
          <label htmlFor="input-busca" className="sr-only">Buscar por nome</label>
          <input
            id="input-busca"
            type="text"
            placeholder="Digite para buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="input-texto"
          />
        </div>

        <div className="campo-select">
          <label htmlFor="select-categoria" className="sr-only">Filtrar por Categoria</label>
          <select
            id="select-categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="input-select"
          >
            <option value="todas">Todas as Categorias</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={carregarDados}
          className="btn-recarregar"
          title="Recarregar dados da API pública"
        >
          Atualizar
        </button>
      </section>

      {/* Contagem */}
      <p className="texto-contagem">
        Exibindo <strong>{produtosFiltrados.length}</strong> de {produtos.length} produtos cadastrados
      </p>

      {/* Listagem ou Estado de Carregamento */}
      {carregando ? (
        <div className="estado-aviso">
          <p>Carregando produtos...</p>
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="estado-aviso">
          <p style={{ marginBottom: '1rem' }}>
            Nenhum produto cadastrado ainda.
          </p>
          <Link href="/novo" className="btn-primario">
            + Cadastrar Primeiro Produto
          </Link>
        </div>
      ) : (
        <div className="grade-cards">
          {produtosFiltrados.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onExcluir={(produto) => setItemParaExcluir(produto)}
            />
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão (Interação com o Usuário) */}
      <Modal
        isOpen={itemParaExcluir !== null}
        onClose={() => setItemParaExcluir(null)}
        onConfirm={confirmarExclusao}
        title="Confirmar Exclusão"
      >
        <p>
          Tem certeza que deseja excluir <strong>{itemParaExcluir?.title}</strong>?
        </p>
        <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
          Esta ação enviará uma requisição <code>DELETE</code> para a API pública.
        </p>
      </Modal>
    </div>
  );
}
