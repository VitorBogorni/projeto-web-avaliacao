'use client';

// ==========================================================================
// TELA 1 · Início (/): lista de produtos.
// Faz GET na API ao abrir; tem busca, filtro por categoria, ordenação,
// botão Atualizar e exclusão (DELETE) com confirmação no Modal.
// ==========================================================================
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PackageOpen, Plus, RefreshCw, Search, SearchX, WifiOff, X } from 'lucide-react';
import ItemCard from '@/components/ItemCard';
import Modal from '@/components/Modal';
import ToastContainer from '@/components/Toast';
import { buscarCategorias, buscarProdutos, excluirProduto } from '@/lib/api';
import { nomeCategoria, normalizar } from '@/lib/formatar';
import { pegarAviso, useToasts } from '@/lib/useToasts';
import { Categoria, Produto } from '@/types/item';

type Ordem = 'recentes' | 'menor-preco' | 'maior-preco' | 'nome';

const ORDENS: { valor: Ordem; rotulo: string }[] = [
  { valor: 'recentes', rotulo: 'Mais recentes' },
  { valor: 'menor-preco', rotulo: 'Menor preço' },
  { valor: 'maior-preco', rotulo: 'Maior preço' },
  { valor: 'nome', rotulo: 'Nome (A a Z)' },
];

function CardEsqueleto() {
  return (
    <div className="card card-esqueleto" aria-hidden="true">
      <div className="card-midia esqueleto" />
      <div className="card-corpo">
        <div className="linha esqueleto" style={{ width: '80%' }} />
        <div className="linha esqueleto" style={{ width: '100%' }} />
        <div className="linha esqueleto" style={{ width: '60%' }} />
      </div>
      <div className="card-rodape">
        <div className="linha esqueleto" style={{ width: '35%', height: '1.2rem' }} />
      </div>
    </div>
  );
}

export default function PaginaInicial() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroApi, setErroApi] = useState('');
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ordem, setOrdem] = useState<Ordem>('recentes');
  const [paraExcluir, setParaExcluir] = useState<Produto | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const { toasts, mostrar, remover } = useToasts();

  // GET ao abrir a página
  useEffect(() => {
    let ativo = true;
    Promise.all([buscarProdutos(), buscarCategorias()])
      .then(([lista, cats]) => {
        if (!ativo) return;
        setProdutos(lista);
        setCategorias(cats);
        // Aviso deixado pela página anterior (ex.: "Produto cadastrado")
        const aviso = pegarAviso();
        if (aviso) mostrar(aviso);
      })
      .catch((erro: Error) => {
        if (ativo) setErroApi(erro.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [mostrar]);

  async function recarregar() {
    setCarregando(true);
    setErroApi('');
    try {
      const [lista, cats] = await Promise.all([buscarProdutos(), buscarCategorias()]);
      setProdutos(lista);
      setCategorias(cats);
      mostrar(lista.length === 1 ? 'Lista atualizada: 1 produto.' : `Lista atualizada: ${lista.length} produtos.`);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao buscar os produtos.';
      setErroApi(mensagem);
      mostrar(mensagem, 'erro');
    } finally {
      setCarregando(false);
    }
  }

  const contagemPorCategoria = useMemo(() => {
    const contagem: Record<string, number> = {};
    for (const p of produtos) contagem[p.category] = (contagem[p.category] ?? 0) + 1;
    return contagem;
  }, [produtos]);

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());
    const filtrados = produtos.filter((p) => {
      const combinaBusca = !termo || normalizar(`${p.title} ${nomeCategoria(p.category)}`).includes(termo);
      return combinaBusca && (!categoria || p.category === categoria);
    });
    if (ordem === 'menor-preco') return [...filtrados].sort((a, b) => a.price - b.price);
    if (ordem === 'maior-preco') return [...filtrados].sort((a, b) => b.price - a.price);
    if (ordem === 'nome') return [...filtrados].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
    return filtrados;
  }, [produtos, busca, categoria, ordem]);

  const temFiltro = busca.trim() !== '' || categoria !== '';

  function limparFiltros() {
    setBusca('');
    setCategoria('');
  }

  // DELETE ao confirmar no modal
  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setExcluindo(true);
    try {
      await excluirProduto(paraExcluir.id);
      setProdutos((atuais) => atuais.filter((p) => p.id !== paraExcluir.id));
      mostrar(`"${paraExcluir.title}" foi excluído.`);
    } catch (erro) {
      mostrar(erro instanceof Error ? erro.message : 'Não foi possível excluir. Tente de novo.', 'erro');
    } finally {
      setExcluindo(false);
      setParaExcluir(null);
    }
  }

  return (
    <>
      <section className="cabecalho">
        <div>
          <p className="sobretitulo">Catálogo</p>
          <h1 className="titulo">Produtos</h1>
          <p className="subtitulo">Cadastre, encontre e remova os produtos da loja, com preço, categoria e foto.</p>
        </div>
      </section>

      <div className="ferramentas">
        <div className="campo-busca">
          <label htmlFor="busca" className="sr-only">
            Buscar produtos pelo nome
          </label>
          <Search size={18} className="icone-busca" aria-hidden="true" />
          <input
            id="busca"
            type="search"
            className="entrada"
            placeholder="Buscar pelo nome"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            autoComplete="off"
          />
          {busca && (
            <button type="button" className="botao-icone limpar" onClick={() => setBusca('')} aria-label="Limpar busca">
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <div>
          <label htmlFor="ordem" className="sr-only">
            Ordenar produtos
          </label>
          <select id="ordem" className="entrada" value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)}>
            {ORDENS.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </div>

        <button type="button" className="botao botao-secundario" onClick={recarregar} disabled={carregando}>
          <RefreshCw size={17} className={carregando ? 'girando' : undefined} aria-hidden="true" />
          Atualizar
        </button>
      </div>

      <div className="chips" role="group" aria-label="Filtrar por categoria">
        <button type="button" className="chip" aria-pressed={categoria === ''} onClick={() => setCategoria('')}>
          Todas
          <span className="chip-numero">{produtos.length}</span>
        </button>
        {categorias.map((c) => (
          <button key={c.id} type="button" className="chip" aria-pressed={categoria === c.nome} onClick={() => setCategoria(c.nome)}>
            {c.nome}
            <span className="chip-numero">{contagemPorCategoria[c.nome] ?? 0}</span>
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="grade" aria-busy="true" aria-label="Carregando produtos">
          {Array.from({ length: 8 }, (_, i) => (
            <CardEsqueleto key={i} />
          ))}
        </div>
      ) : erroApi ? (
        <div className="estado estado-erro" role="alert">
          <span className="estado-icone" aria-hidden="true">
            <WifiOff size={26} />
          </span>
          <h2>Não foi possível carregar os produtos</h2>
          <p>{erroApi}</p>
          <div className="acoes">
            <button type="button" className="botao botao-primario" onClick={recarregar}>
              <RefreshCw size={17} aria-hidden="true" />
              Tentar de novo
            </button>
          </div>
        </div>
      ) : produtos.length === 0 ? (
        <div className="estado">
          <span className="estado-icone" aria-hidden="true">
            <PackageOpen size={26} />
          </span>
          <h2>Nenhum produto por aqui</h2>
          <p>Cadastre o primeiro produto para ele aparecer no catálogo.</p>
          <div className="acoes">
            <Link href="/novo" className="botao botao-primario">
              <Plus size={18} aria-hidden="true" />
              Cadastrar produto
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="resumo" aria-live="polite">
            {visiveis.length === produtos.length
              ? `${produtos.length} ${produtos.length === 1 ? 'produto' : 'produtos'}`
              : `Mostrando ${visiveis.length} de ${produtos.length} produtos`}
          </p>

          {visiveis.length === 0 ? (
            <div className="estado">
              <span className="estado-icone" aria-hidden="true">
                <SearchX size={26} />
              </span>
              <h2>Nenhum produto encontrado</h2>
              <p>Nenhum produto combina com a busca ou a categoria escolhida.</p>
              {temFiltro && (
                <div className="acoes">
                  <button type="button" className="botao botao-secundario" onClick={limparFiltros}>
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grade">
              {visiveis.map((produto) => (
                <ItemCard key={produto.id} item={produto} onExcluir={setParaExcluir} />
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={paraExcluir !== null}
        onClose={() => !excluindo && setParaExcluir(null)}
        onConfirm={confirmarExclusao}
        title="Excluir produto?"
        carregando={excluindo}
      >
        <p>
          <strong>{paraExcluir?.title}</strong> vai sair do catálogo. Essa ação não pode ser desfeita.
        </p>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={remover} />
    </>
  );
}
