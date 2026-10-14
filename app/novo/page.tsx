'use client';

import { FormEvent, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FormField from '@/components/FormField';
import { cadastrarProduto } from '@/lib/api';
import { converterPreco, ErrosFormulario, LIMITES, validarCampo, validarProduto } from '@/lib/validacao';
import { CATEGORIAS, FormularioProduto } from '@/types/item';

const FORM_VAZIO: FormularioProduto = {
  title: '',
  category: '',
  price: '',
  thumbnail: '',
  description: '',
};

// Ordem dos campos na tela (para levar o foco ao primeiro erro)
const ORDEM_CAMPOS: (keyof FormularioProduto)[] = ['title', 'category', 'price', 'thumbnail', 'description'];

export default function NovoProdutoPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<FormularioProduto>(FORM_VAZIO);
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [erroEnvio, setErroEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);

  function alterar(campo: keyof FormularioProduto, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    // Se o campo já estava com erro, revalida enquanto a pessoa corrige
    if (erros[campo]) {
      setErros((atual) => ({ ...atual, [campo]: validarCampo(campo, valor) }));
    }
  }

  // Valida ao sair do campo, sem esperar o envio
  function aoSair(campo: keyof FormularioProduto) {
    setErros((atual) => ({ ...atual, [campo]: validarCampo(campo, form[campo]) }));
  }

  // Classe e atributos de acessibilidade de cada campo.
  // aria-describedby aponta para a mensagem do FormField ("<id>-erro").
  function propsCampo(campo: keyof FormularioProduto) {
    return {
      id: campo,
      className: erros[campo] ? 'input-formulario borda-erro' : 'input-formulario',
      'aria-invalid': erros[campo] ? true : undefined,
      'aria-describedby': erros[campo] ? `${campo}-erro` : undefined,
      onBlur: () => aoSair(campo),
    };
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErroEnvio('');
    const encontrados = validarProduto(form);
    setErros(encontrados);

    const primeiroErro = ORDEM_CAMPOS.find((campo) => encontrados[campo]);
    if (primeiroErro) {
      formRef.current?.querySelector<HTMLElement>(`#${primeiroErro}`)?.focus();
      return;
    }

    setEnviando(true);
    try {
      await cadastrarProduto({
        title: form.title.trim(),
        category: form.category,
        price: converterPreco(form.price),
        thumbnail: form.thumbnail.trim(),
        description: form.description.trim(),
      });
      router.push('/');
    } catch {
      setErroEnvio('Não foi possível cadastrar agora. Verifique a conexão e tente de novo.');
      setEnviando(false);
    }
  }

  return (
    <div className="container">
      <section className="painel-topo">
        <h1 className="titulo-pagina">Novo produto</h1>
        <p className="subtitulo-pagina">Todos os campos são obrigatórios.</p>
      </section>

      <form ref={formRef} onSubmit={enviar} noValidate className="cartao-formulario">
        <FormField id="title" label="Título" required error={erros.title}>
          <input
            type="text"
            value={form.title}
            maxLength={LIMITES.tituloMax}
            onChange={(e) => alterar('title', e.target.value)}
            {...propsCampo('title')}
          />
        </FormField>

        <FormField id="category" label="Categoria" required error={erros.category}>
          <select value={form.category} onChange={(e) => alterar('category', e.target.value)} {...propsCampo('category')}>
            <option value="">Selecione...</option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="price" label="Preço (R$)" required error={erros.price}>
          <input
            type="text"
            inputMode="decimal"
            placeholder="19,90"
            value={form.price}
            onChange={(e) => alterar('price', e.target.value)}
            {...propsCampo('price')}
          />
        </FormField>

        <FormField id="thumbnail" label="Link da imagem" required error={erros.thumbnail}>
          <input
            type="url"
            placeholder="https://..."
            value={form.thumbnail}
            onChange={(e) => alterar('thumbnail', e.target.value)}
            {...propsCampo('thumbnail')}
          />
        </FormField>

        <FormField id="description" label="Descrição" required error={erros.description}>
          <textarea
            rows={4}
            value={form.description}
            maxLength={LIMITES.descricaoMax}
            onChange={(e) => alterar('description', e.target.value)}
            {...propsCampo('description')}
          />
          <small className="subtitulo-pagina">
            {form.description.trim().length}/{LIMITES.descricaoMax} caracteres
          </small>
        </FormField>

        {erroEnvio && (
          <p role="alert" className="texto-erro">
            {erroEnvio}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Link href="/" className="btn-secundario">
            Cancelar
          </Link>
          <button type="submit" className="btn-primario" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Cadastrar produto'}
          </button>
        </div>
      </form>
    </div>
  );
}
