// ==========================================================================
// FRONT e BACK · Regras de validação do produto, da categoria e do login
// (usadas na tela e no servidor).
// ==========================================================================
import { FormularioProduto, LIMITES_CATEGORIA } from '@/types/item';

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

// Valida um campo só (usado quando a pessoa sai do campo).
// "categorias": nomes das categorias existentes (a tela informa; o servidor confere só o formato).
export function validarCampo(campo: keyof FormularioProduto, valor: string, categorias?: string[]): string | undefined {
  const texto = valor.trim();

  switch (campo) {
    case 'title':
      if (!texto) return 'Informe o título do produto.';
      if (texto.length < LIMITES.tituloMin) return `O título precisa ter pelo menos ${LIMITES.tituloMin} caracteres.`;
      if (texto.length > LIMITES.tituloMax) return `O título pode ter no máximo ${LIMITES.tituloMax} caracteres.`;
      return undefined;

    case 'category':
      if (!texto) return 'Escolha uma categoria.';
      if (texto.length > LIMITES_CATEGORIA.max) return 'Categoria inválida.';
      if (categorias && !categorias.includes(texto)) return 'Escolha uma categoria da lista.';
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
export function validarProduto(form: FormularioProduto, categorias?: string[]): ErrosFormulario {
  const erros: ErrosFormulario = {};
  for (const campo of Object.keys(form) as (keyof FormularioProduto)[]) {
    const erro = validarCampo(campo, form[campo], categorias);
    if (erro) erros[campo] = erro;
  }
  return erros;
}

// ---------- Login ----------

export interface FormularioLogin {
  email: string;
  senha: string;
}

export type ErrosLogin = Partial<Record<keyof FormularioLogin, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarCampoLogin(campo: keyof FormularioLogin, valor: string): string | undefined {
  if (campo === 'email') {
    if (!valor.trim()) return 'Informe o e-mail.';
    if (!EMAIL_RE.test(valor.trim())) return 'Digite um e-mail válido. Ex.: nome@empresa.com';
    return undefined;
  }
  if (!valor) return 'Informe a senha.';
  if (valor.length < 6) return 'A senha tem pelo menos 6 caracteres.';
  return undefined;
}

export function validarLogin(form: FormularioLogin): ErrosLogin {
  const erros: ErrosLogin = {};
  for (const campo of ['email', 'senha'] as const) {
    const erro = validarCampoLogin(campo, form[campo]);
    if (erro) erros[campo] = erro;
  }
  return erros;
}

// ---------- Categoria ----------

// Compara nomes sem diferenciar maiúsculas e acentos ("moveis" = "Móveis")
export function chaveCategoria(nome: string) {
  return nome.trim().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function validarNomeCategoria(nome: string, existentes: string[] = []): string | undefined {
  const texto = nome.trim();
  if (!texto) return 'Informe o nome da categoria.';
  if (texto.length < LIMITES_CATEGORIA.min) return `Use pelo menos ${LIMITES_CATEGORIA.min} caracteres.`;
  if (texto.length > LIMITES_CATEGORIA.max) return `Use no máximo ${LIMITES_CATEGORIA.max} caracteres.`;
  if (existentes.some((e) => chaveCategoria(e) === chaveCategoria(texto))) return 'Já existe uma categoria com esse nome.';
  return undefined;
}
