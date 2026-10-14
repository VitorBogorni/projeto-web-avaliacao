'use client';

// ==========================================================================
// TELA · Categorias (/categorias): cadastrar e excluir categorias.
// Lista com GET /api/categorias, cadastra com POST e exclui com DELETE.
// Não deixa excluir categoria que ainda tem produtos (o servidor responde 409).
// ==========================================================================
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CircleAlert, LoaderCircle, Plus, Tags, Trash2, WifiOff } from 'lucide-react';
import FormField from '@/components/FormField';
import Modal from '@/components/Modal';
import ToastContainer from '@/components/Toast';
import { buscarCategorias, buscarProdutos, cadastrarCategoria, ErroApi, excluirCategoria } from '@/lib/api';
import { useToasts } from '@/lib/useToasts';
import { validarNomeCategoria } from '@/lib/validacao';
import { Categoria, LIMITES_CATEGORIA, Produto } from '@/types/item';

export default function CategoriasPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState('');
  const [nome, setNome] = useState('');
  const [erroNome, setErroNome] = useState<string | undefined>();
  const [salvando, setSalvando] = useState(false);
  const [paraExcluir, setParaExcluir] = useState<Categoria | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const { toasts, mostrar, remover } = useToasts();

  // GET das categorias e dos produtos (para contar quantos produtos cada uma tem)
  useEffect(() => {
    let ativo = true;
    Promise.all([buscarCategorias(), buscarProdutos()])
      .then(([cats, prods]) => {
        if (!ativo) return;
        setCategorias(cats);
        setProdutos(prods);
      })
      .catch((erro: Error) => {
        if (ativo) setErroCarga(erro.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const quantidade = useMemo(() => {
    const contagem: Record<string, number> = {};
    for (const p of produtos) contagem[p.category] = (contagem[p.category] ?? 0) + 1;
    return contagem;
  }, [produtos]);

  // POST /api/categorias
  async function adicionar(e: FormEvent) {
    e.preventDefault();
    const problema = validarNomeCategoria(nome, categorias.map((c) => c.nome));
    setErroNome(problema);
    if (problema) {
      inputRef.current?.focus();
      return;
    }
    setSalvando(true);
    try {
      const nova = await cadastrarCategoria(nome.trim());
      setCategorias((atuais) => [...atuais, nova].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
      setNome('');
      mostrar(`Categoria "${nova.nome}" cadastrada.`);
      inputRef.current?.focus();
    } catch (erro) {
      if (erro instanceof ErroApi && erro.campos.nome) setErroNome(erro.campos.nome);
      else mostrar(erro instanceof Error ? erro.message : 'Não foi possível cadastrar.', 'erro');
    } finally {
      setSalvando(false);
    }
  }

  // Clicar em excluir: categoria com produtos não pode sair
  function pedirExclusao(categoria: Categoria) {
    const total = quantidade[categoria.nome] ?? 0;
    if (total > 0) {
      mostrar(`"${categoria.nome}" tem ${total} ${total === 1 ? 'produto' : 'produtos'}. Exclua ou troque os produtos antes.`, 'erro');
      return;
    }
    setParaExcluir(categoria);
  }

  // DELETE /api/categorias/:id
  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setExcluindo(true);
    try {
      await excluirCategoria(paraExcluir.id);
      setCategorias((atuais) => atuais.filter((c) => c.id !== paraExcluir.id));
      mostrar(`Categoria "${paraExcluir.nome}" excluída.`);
    } catch (erro) {
      mostrar(erro instanceof Error ? erro.message : 'Não foi possível excluir.', 'erro');
    } finally {
      setExcluindo(false);
      setParaExcluir(null);
    }
  }

  return (
    <>
      <section className="cabecalho">
        <div>
          <p className="sobretitulo">Organização</p>
          <h1 className="titulo">Categorias</h1>
          <p className="subtitulo">As categorias aparecem no cadastro de produtos e nos filtros do catálogo.</p>
        </div>
      </section>

      <div className="layout-categorias">
        <form onSubmit={adicionar} noValidate className="painel formulario" aria-label="Nova categoria">
          <h2 className="painel-titulo">Nova categoria</h2>
          <FormField
            id="nome"
            label="Nome"
            required
            error={erroNome}
            hint={`De ${LIMITES_CATEGORIA.min} a ${LIMITES_CATEGORIA.max} caracteres. Ex.: Eletrônicos`}
          >
            <input
              ref={inputRef}
              id="nome"
              name="nome"
              type="text"
              className="entrada"
              value={nome}
              maxLength={LIMITES_CATEGORIA.max}
              onChange={(e) => {
                setNome(e.target.value);
                if (erroNome) setErroNome(validarNomeCategoria(e.target.value, categorias.map((c) => c.nome)));
              }}
              aria-invalid={erroNome ? true : undefined}
              aria-describedby={erroNome ? 'nome-erro' : 'nome-dica'}
              aria-required
            />
          </FormField>
          <button type="submit" className="botao botao-primario" disabled={salvando}>
            {salvando ? <LoaderCircle size={18} className="girando" aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
            {salvando ? 'Salvando...' : 'Adicionar categoria'}
          </button>
        </form>

        <section className="painel lista-categorias" aria-labelledby="titulo-lista">
          <h2 id="titulo-lista" className="painel-titulo">
            Cadastradas {!carregando && !erroCarga && <span className="chip-numero">{categorias.length}</span>}
          </h2>

          {carregando ? (
            <p className="lista-vazia">Carregando categorias...</p>
          ) : erroCarga ? (
            <div className="alerta alerta-erro" role="alert">
              <WifiOff size={18} aria-hidden="true" />
              <span>{erroCarga}</span>
            </div>
          ) : categorias.length === 0 ? (
            <div className="lista-vazia">
              <Tags size={22} aria-hidden="true" />
              <p>Nenhuma categoria ainda. Cadastre a primeira ao lado.</p>
            </div>
          ) : (
            <ul className="categorias">
              {categorias.map((c) => {
                const total = quantidade[c.nome] ?? 0;
                return (
                  <li key={c.id} className="categoria-linha">
                    <span className="categoria-icone" aria-hidden="true">
                      <Tags size={18} />
                    </span>
                    <span className="categoria-nome">{c.nome}</span>
                    <span className="categoria-total">
                      {total === 0 ? 'Nenhum produto' : `${total} ${total === 1 ? 'produto' : 'produtos'}`}
                    </span>
                    <button
                      type="button"
                      className="botao-icone perigo"
                      onClick={() => pedirExclusao(c)}
                      aria-label={`Excluir a categoria ${c.nome}`}
                      title="Excluir"
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {!carregando && !erroCarga && categorias.length > 0 && (
            <p className="lista-dica">
              <CircleAlert size={15} aria-hidden="true" />
              Categoria com produtos não pode ser excluída.
            </p>
          )}
        </section>
      </div>

      <Modal
        isOpen={paraExcluir !== null}
        onClose={() => !excluindo && setParaExcluir(null)}
        onConfirm={confirmarExclusao}
        title="Excluir categoria?"
        carregando={excluindo}
      >
        <p>
          A categoria <strong>{paraExcluir?.nome}</strong> vai sair da lista e dos filtros.
        </p>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={remover} />
    </>
  );
}
