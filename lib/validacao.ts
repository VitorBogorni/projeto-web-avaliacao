import { CATEGORIAS, FormularioProduto } from '@/types/item';

// Erros do formulário: uma mensagem por campo (só os campos com problema aparecem)
export type ErrosFormulario = Partial<Record<keyof FormularioProduto, string>>;

export const LIMITES = {
  tituloMin: 3,
  tituloMax: 100,
  descricaoMin: 10,
  descricaoMax: 500,
  precoMax: 1000000,
};

// Aceita "19,90" ou "19.90" e devolve o número (ou NaN se não for número)
export function converterPreco(valor: string): number {
  const limpo = valor.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return NaN;
  return Number(limpo);
}

function urlValida(valor: string): boolean {
  try {
    const url = new URL(valor);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Valida um campo só (usado quando a pessoa sai do campo)
export function validarCampo(campo: keyof FormularioProduto, valor: string): string | undefined {
  const texto = valor.trim();

  switch (campo) {
    case 'title':
      if (!texto) return 'Informe o título do produto.';
      if (texto.length < LIMITES.tituloMin) return `O título precisa ter pelo menos ${LIMITES.tituloMin} caracteres.`;
      if (texto.length > LIMITES.tituloMax) return `O título pode ter no máximo ${LIMITES.tituloMax} caracteres.`;
      return undefined;

    case 'category':
      if (!texto) return 'Escolha uma categoria.';
      if (!CATEGORIAS.includes(texto)) return 'Categoria inválida.';
      return undefined;

    case 'price': {
      if (!texto) return 'Informe o preço.';
      const preco = converterPreco(texto);
      if (Number.isNaN(preco)) return 'Use só números, com até 2 casas decimais (ex.: 19,90).';
      if (preco <= 0) return 'O preço precisa ser maior que zero.';
      if (preco > LIMITES.precoMax) return 'Preço muito alto.';
      return undefined;
    }

    case 'thumbnail':
      if (!texto) return 'Informe o link da imagem.';
      if (!urlValida(texto)) return 'Use um link completo, começando com http:// ou https://.';
      return undefined;

    case 'description':
      if (!texto) return 'Informe a descrição.';
      if (texto.length < LIMITES.descricaoMin) return `A descrição precisa ter pelo menos ${LIMITES.descricaoMin} caracteres.`;
      if (texto.length > LIMITES.descricaoMax) return `A descrição pode ter no máximo ${LIMITES.descricaoMax} caracteres.`;
      return undefined;
  }
}

// Valida o formulário inteiro (usado no envio)
export function validarProduto(form: FormularioProduto): ErrosFormulario {
  const erros: ErrosFormulario = {};
  for (const campo of Object.keys(form) as (keyof FormularioProduto)[]) {
    const erro = validarCampo(campo, form[campo]);
    if (erro) erros[campo] = erro;
  }
  return erros;
}
