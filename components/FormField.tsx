'use client';

// ==========================================================================
// COMPONENTE · Um campo de formulário: rótulo, ajuda e mensagem de erro
// (lida pelo leitor de tela). Usado 5 vezes no cadastro.
// ==========================================================================
import { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';

interface FormFieldProps {
  id?: string;
  htmlFor?: string;
  label: string;
  required?: boolean;
  error?: string;
  // Texto de ajuda abaixo do campo (id: "<id>-dica")
  hint?: string;
  // Conteúdo extra à direita da linha de ajuda (ex.: contador de caracteres)
  extra?: ReactNode;
  children: ReactNode;
}

// Rótulo + campo + ajuda + erro. O campo deve apontar aria-describedby para "<id>-dica" e "<id>-erro".
export default function FormField({ id, htmlFor, label, required = false, error, hint, extra, children }: FormFieldProps) {
  const alvo = id || htmlFor || '';

  return (
    <div className="campo">
      <label htmlFor={alvo} className="campo-rotulo">
        {label}
        {required && (
          <span className="campo-obrigatorio" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {(hint || extra) && !error && (
        <div className="campo-rodape">
          {hint && (
            <span id={`${alvo}-dica`} className="campo-dica">
              {hint}
            </span>
          )}
          {extra}
        </div>
      )}

      {error && (
        <div className="campo-rodape">
          <span id={`${alvo}-erro`} role="alert" className="campo-erro">
            <CircleAlert size={15} aria-hidden="true" />
            {error}
          </span>
          {extra}
        </div>
      )}
    </div>
  );
}
