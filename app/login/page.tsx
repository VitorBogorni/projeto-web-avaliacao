'use client';

// ==========================================================================
// TELA · Login (/login): entrada no sistema.
// Valida e-mail e senha na tela, envia com POST /api/login e, se der certo,
// abre o catálogo (ou a página que a pessoa tentou abrir antes).
// ==========================================================================
import { FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, CircleAlert, LayoutGrid, LoaderCircle, LogIn, Package, ShieldCheck, Smartphone } from 'lucide-react';
import FormField from '@/components/FormField';
import { entrar, ErroApi } from '@/lib/api';
import { ErrosLogin, FormularioLogin, validarCampoLogin, validarLogin } from '@/lib/validacao';

// Só aceita voltar para uma página deste site
function destinoDepoisDoLogin() {
  const voltar = new URLSearchParams(window.location.search).get('voltar') ?? '';
  return voltar.startsWith('/') && !voltar.startsWith('//') ? voltar : '/';
}

export default function LoginPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<FormularioLogin>({ email: '', senha: '' });
  const [erros, setErros] = useState<ErrosLogin>({});
  const [erroEnvio, setErroEnvio] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function alterar(campo: keyof FormularioLogin, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: validarCampoLogin(campo, valor) }));
  }

  function aoSair(campo: keyof FormularioLogin) {
    if (!form[campo] && !erros[campo]) return;
    setErros((atual) => ({ ...atual, [campo]: validarCampoLogin(campo, form[campo]) }));
  }

  function propsCampo(campo: keyof FormularioLogin) {
    return {
      id: campo,
      name: campo,
      className: 'entrada',
      'aria-invalid': erros[campo] ? true : undefined,
      'aria-describedby': erros[campo] ? `${campo}-erro` : undefined,
      'aria-required': true,
      onBlur: () => aoSair(campo),
    };
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErroEnvio('');
    const encontrados = validarLogin(form);
    setErros(encontrados);
    const primeiro = (['email', 'senha'] as const).find((c) => encontrados[c]);
    if (primeiro) {
      formRef.current?.querySelector<HTMLElement>(`#${primeiro}`)?.focus();
      return;
    }

    setEnviando(true);
    try {
      await entrar(form.email.trim(), form.senha);
      router.replace(destinoDepoisDoLogin());
      router.refresh();
    } catch (erro) {
      if (erro instanceof ErroApi && erro.status === 401) {
        setErroEnvio('E-mail ou senha incorretos. Confira e tente de novo.');
        formRef.current?.querySelector<HTMLElement>('#senha')?.focus();
      } else {
        setErroEnvio(erro instanceof Error ? erro.message : 'Não foi possível entrar agora.');
      }
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <section className="login-apresentacao" aria-labelledby="login-objetivo">
        <span className="marca-icone marca-icone-grande" aria-hidden="true">
          <Package size={28} strokeWidth={2.2} />
        </span>
        <p className="sobretitulo">Catálogo de Produtos</p>
        {/* Parágrafo, não título: o título principal da página é o "Entrar" (h1) */}
        <p id="login-objetivo" className="login-titulo">
          O catálogo da sua loja, organizado em um só lugar.
        </p>
        <p className="login-texto">
          Cadastre, consulte e remova produtos com preço, categoria e foto, pelo computador ou pelo celular.
        </p>
        <ul className="login-beneficios">
          <li>
            <LayoutGrid size={20} aria-hidden="true" />
            <span>Encontre qualquer produto pela busca ou pela categoria.</span>
          </li>
          <li>
            <ShieldCheck size={20} aria-hidden="true" />
            <span>Dados conferidos antes de salvar: nada entra incompleto.</span>
          </li>
          <li>
            <Smartphone size={20} aria-hidden="true" />
            <span>Funciona em qualquer tela, do celular ao computador.</span>
          </li>
        </ul>
      </section>

      <section className="painel login-cartao" aria-labelledby="login-titulo">
        <h1 id="login-titulo" className="titulo">
          Entrar
        </h1>
        <p className="subtitulo">Use seu e-mail e senha para acessar o catálogo.</p>

        <form ref={formRef} onSubmit={enviar} noValidate className="login-form" aria-label="Entrar no sistema">
          <FormField id="email" label="E-mail" required error={erros.email}>
            <input
              type="email"
              autoComplete="username"
              placeholder="nome@empresa.com"
              value={form.email}
              onChange={(e) => alterar('email', e.target.value)}
              {...propsCampo('email')}
            />
          </FormField>

          <FormField id="senha" label="Senha" required error={erros.senha}>
            <div className="entrada-com-botao">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.senha}
                onChange={(e) => alterar('senha', e.target.value)}
                {...propsCampo('senha')}
              />
              <button
                type="button"
                className="botao-icone"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-pressed={mostrarSenha}
                aria-label={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </FormField>

          {erroEnvio && (
            <div className="alerta alerta-erro" role="alert">
              <CircleAlert size={18} aria-hidden="true" />
              <span>{erroEnvio}</span>
            </div>
          )}

          <button type="submit" className="botao botao-primario botao-largo" disabled={enviando}>
            {enviando ? <LoaderCircle size={18} className="girando" aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

      </section>
    </div>
  );
}
