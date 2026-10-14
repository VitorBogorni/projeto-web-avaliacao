'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, onConfirm, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div className="modal-caixa">
        <div className="modal-topo">
          <h2 id="modal-titulo" className="modal-titulo">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="modal-btn-fechar"
            aria-label="Fechar modal"
          >
            X
          </button>
        </div>

        <div className="modal-corpo">{children}</div>

        <div className="modal-rodape">
          <button type="button" onClick={onClose} className="btn-secundario">
            Cancelar
          </button>
          {onConfirm && (
            <button type="button" onClick={onConfirm} className="btn-perigo">
              Confirmar Exclusão
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
