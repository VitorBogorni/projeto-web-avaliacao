'use client';

// ==========================================================================
// COMPONENTE · Formulário de produto (5 campos), usado no cadastro e na edição.
// Busca as categorias (GET /api/categorias), valida na tela, mostra a
// pré-visualização do card e exibe os erros que o servidor devolver (400).
// Quem usa decide o que fazer ao salvar (POST para criar, PATCH para editar).
// ==========================================================================
import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CircleAlert, LoaderCircle } from 'lucide-react';
import FormField from '@/components/FormField';
import ItemCard from '@/components/ItemCard';
import { buscarCategorias, ErroApi } from '@/lib/api';
import { converterPreco, ErrosFormulario, LIMITES, validarCampo, validarProduto } from '@/lib/validacao';
import { Categoria, FormularioProduto as Formulario } from '@/types/item';

export interface DadosProduto {
  title: string;
  category: string;
  price: number;
  thumbnail: string;
  description: string;
}

interface Props {
  inicial?: Formulario;
  textoBotao: string;
  cancelarHref: string;
  rotulo: string;
  // Salva (POST ou PATCH). Se der erro, o formulário mostra a mensagem.
  onSalvar: (dados: DadosProduto) => Promise<void>;
}

const FORM_VAZIO: Formulario = {
  title: '',
  category: '',
  price: '',
  thumbnail: '',
  description: '',
};

// Ordem dos campos na tela (para levar o foco ao primeiro erro)
const ORDEM_CAMPOS: (keyof Formulario)[] = ['title', 'category', 'price', 'thumbnail', 'description'];

const DICAS: Record<keyof Formulario, string> = {
  title: `De ${LIMITES.tituloMin} a ${LIMITES.tituloMax} caracteres.`,
  category: 'Escolha onde o produto aparece no catálogo.',
  price: 'Use vírgula para os centavos. Ex.: 19,90',
  thumbnail: 'Link completo da foto, começando com https://',
  description: `De ${LIMITES.descricaoMin} a ${LIMITES.descricaoMax} caracteres.`,
};

export default function FormularioProduto({ inicial = FORM_VAZIO, textoBotao, cancelarHref, rotulo, onSalvar }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<Formulario>(inicial);
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [erroEnvio, setErroEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);
  const nomesCategorias = categorias.map((c) => c.nome);

  // GET /api/categorias para montar a lista do campo Categoria
  useEffect(() => {
    let ativo = true;
    buscarCategorias()
      .then((lista) => {
        if (ativo) setCategorias(lista);
      })
      .catch((erro: Error) => {
        if (ativo) setErroEnvio(`Não foi possível carregar as categorias. ${erro.message}`);
      })
      .finally(() => {
        if (ativo) setCarregandoCategorias(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  function alterar(campo: keyof Formulario, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    // Se o campo já estava com erro, revalida enquanto a pessoa corrige
    if (erros[campo]) {
      setErros((atual) => ({ ...atual, [campo]: validarCampo(campo, valor, nomesCategorias) }));
    }
  }

  // Valida ao sair do campo, sem esperar o envio (campo vazio só reclama no envio)
  function aoSair(campo: keyof Formulario) {
    if (!form[campo].trim() && !erros[campo]) return;
    setErros((atual) => ({ ...atual, [campo]: validarCampo(campo, form[campo], nomesCategorias) }));
  }

  // Atributos comuns de cada campo: acessibilidade + validação ao sair
  function propsCampo(campo: keyof Formulario) {
    return {
      id: campo,
      name: campo,
      className: 'entrada',
      'aria-invalid': erros[campo] ? true : undefined,
      'aria-describedby': erros[campo] ? `${campo}-erro` : `${campo}-dica`,
      'aria-required': true,
      onBlur: () => aoSair(campo),
    };
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErroEnvio('');
    const encontrados = validarProduto(form, nomesCategorias);
    setErros(encontrados);

    const primeiroErro = ORDEM_CAMPOS.find((campo) => encontrados[campo]);
    if (primeiroErro) {
      formRef.current?.querySelector<HTMLElement>(`#${primeiroErro}`)?.focus();
      return;
    }

    setEnviando(true);
    try {
      await onSalvar({
        title: form.title.trim(),
        category: form.category,
        price: converterPreco(form.price),
        thumbnail: form.thumbnail.trim(),
        description: form.description.trim(),
      });
    } catch (erro) {
      // 400: o servidor também valida; mostra cada erro no campo certo
      if (erro instanceof ErroApi && erro.status === 400 && Object.keys(erro.campos).length > 0) {
        setErros(erro.campos as ErrosFormulario);
        const campo = ORDEM_CAMPOS.find((c) => erro.campos[c]);
        if (campo) formRef.current?.querySelector<HTMLElement>(`#${campo}`)?.focus();
      }
      setErroEnvio(erro instanceof Error ? erro.message : 'Não foi possível salvar agora. Tente de novo.');
      setEnviando(false);
    }
  }

  const precoPrevia = converterPreco(form.price);
  const previa = {
    id: 0,
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    price: Number.isNaN(precoPrevia) ? 0 : precoPrevia,
    thumbnail: validarCampo('thumbnail', form.thumbnail) ? '' : form.thumbnail.trim(),
  };

  return (
    <div className="layout-cadastro">
      <form ref={formRef} onSubmit={enviar} noValidate className="painel formulario" aria-label={rotulo}>
        <FormField id="title" label="Título" required error={erros.title} hint={DICAS.title}>
          <input
            type="text"
            value={form.title}
            maxLength={LIMITES.tituloMax}
            placeholder="Ex.: Perfume Floral 100 ml"
            onChange={(e) => alterar('title', e.target.value)}
            {...propsCampo('title')}
          />
        </FormField>

        <div className="linha-dupla">
          <FormField id="category" label="Categoria" required error={erros.category} hint={DICAS.category}>
            <select value={form.category} onChange={(e) => alterar('category', e.target.value)} {...propsCampo('category')}>
              <option value="">{carregandoCategorias ? 'Carregando...' : 'Selecione'}</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.nome}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="price" label="Preço" required error={erros.price} hint={DICAS.price}>
            <div className="entrada-prefixo">
              <span aria-hidden="true">R$</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={form.price}
                onChange={(e) => alterar('price', e.target.value)}
                {...propsCampo('price')}
              />
            </div>
          </FormField>
        </div>

        <FormField id="thumbnail" label="Link da imagem" required error={erros.thumbnail} hint={DICAS.thumbnail}>
          <input
            type="url"
            placeholder="https://"
            value={form.thumbnail}
            onChange={(e) => alterar('thumbnail', e.target.value)}
            {...propsCampo('thumbnail')}
          />
        </FormField>

        <FormField
          id="description"
          label="Descrição"
          required
          error={erros.description}
          hint={DICAS.description}
          extra={
            <span className="campo-contador" aria-hidden="true">
              {form.description.trim().length}/{LIMITES.descricaoMax}
            </span>
          }
        >
          <textarea
            rows={4}
            value={form.description}
            maxLength={LIMITES.descricaoMax}
            placeholder="Conte o que é o produto, tamanho, cor, material..."
            onChange={(e) => alterar('description', e.target.value)}
            {...propsCampo('description')}
          />
        </FormField>

        {!carregandoCategorias && categorias.length === 0 && !erroEnvio && (
          <div className="alerta alerta-aviso" role="status">
            <CircleAlert size={18} aria-hidden="true" />
            <span>
              Nenhuma categoria cadastrada. <Link href="/categorias">Cadastre uma categoria</Link> antes do produto.
            </span>
          </div>
        )}

        {erroEnvio && (
          <div className="alerta alerta-erro" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <span>{erroEnvio}</span>
          </div>
        )}

        <div className="formulario-acoes">
          <Link href={cancelarHref} className="botao botao-secundario">
            Cancelar
          </Link>
          <button type="submit" className="botao botao-primario" disabled={enviando}>
            {enviando && <LoaderCircle size={18} className="girando" aria-hidden="true" />}
            {enviando ? 'Salvando...' : textoBotao}
          </button>
        </div>
      </form>

      <aside className="previa" aria-label="Pré-visualização">
        <p className="previa-titulo">Pré-visualização</p>
        <ItemCard key={previa.thumbnail} item={previa} apenasVisual />
        <p className="previa-dica">É assim que o produto vai aparecer no catálogo.</p>
      </aside>
    </div>
  );
}
