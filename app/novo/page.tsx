'use client';

// ==========================================================================
// TELA · Novo produto (/novo): usa o componente FormularioProduto
// e salva com POST /api/produtos.
// ==========================================================================
import { useRouter } from 'next/navigation';
import FormularioProduto, { DadosProduto } from '@/components/FormularioProduto';
import { cadastrarProduto } from '@/lib/api';
import { guardarAviso } from '@/lib/useToasts';

export default function NovoProdutoPage() {
  const router = useRouter();

  async function salvar(dados: DadosProduto) {
    const criado = await cadastrarProduto(dados);
    guardarAviso(`"${criado.title}" foi cadastrado.`);
    router.push('/');
  }

  return (
    <>
      <section className="cabecalho">
        <div>
          <p className="sobretitulo">Cadastro</p>
          <h1 className="titulo">Novo produto</h1>
          <p className="subtitulo">Preencha os dados abaixo. Todos os campos são obrigatórios.</p>
        </div>
      </section>

      <FormularioProduto rotulo="Cadastro de produto" textoBotao="Cadastrar produto" cancelarHref="/" onSalvar={salvar} />
    </>
  );
}
