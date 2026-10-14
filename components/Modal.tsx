'use client';

// ==========================================================================
// COMPONENTE · Janela de confirmação. Abre com o foco no "Cancelar",
// fecha com Esc ou clicando fora. Usado para confirmar exclusões.
// ==========================================================================
import { ReactNode, useEffect, useRef } from 'react';
import { TriangleAlert } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  carregando?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = 'Excluir',
  carregando = false,
}: ModalProps) {
  const cancelarRef = useRef<HTMLButtonElement>(null);
  // A página costuma passar uma função nova a cada render; a ref evita reabrir o efeito por isso
  const fecharRef = useRef(onClose);
  useEffect(() => {
    fecharRef.current = onClose;
  }, [onClose]);

  // Ao abrir: foco no "Cancelar" (a opção segura), Esc fecha e a página atrás não rola
  useEffect(() => {
    if (!isOpen) return;
    const focoAnterior = document.activeElement as HTMLElement | null;
    cancelarRef.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fecharRef.current();
    };
    document.addEventListener('keydown', aoTeclar);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflowAnterior;
      focoAnterior?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-fundo"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-caixa" role="alertdialog" aria-modal="true" aria-labelledby="modal-titulo" aria-describedby="modal-corpo">
        <div className="modal-topo">
          <span className="modal-icone" aria-hidden="true">
            <TriangleAlert size={22} />
          </span>
          <div>
            <h2 id="modal-titulo" className="modal-titulo">
              {title}
            </h2>
            <div id="modal-corpo" className="modal-corpo">
              {children}
            </div>
          </div>
        </div>

        <div className="modal-rodape">
          <button ref={cancelarRef} type="button" onClick={onClose} className="botao botao-secundario" disabled={carregando}>
            Cancelar
          </button>
          {onConfirm && (
            <button type="button" onClick={onConfirm} className="botao botao-perigo" disabled={carregando}>
              {carregando ? 'Excluindo...' : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
