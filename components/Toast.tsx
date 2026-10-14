'use client';

// ==========================================================================
// COMPONENTE · Avisos que aparecem no canto da tela (sucesso ou erro)
// e somem sozinhos. Ex.: "Produto cadastrado".
// ==========================================================================
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { ToastMessage } from '@/types/cliente';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove?: (id: string) => void;
  onRemover?: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove, onRemover }: ToastProps) {
  const remover = (id: string) => (onRemove ?? onRemover)?.(id);

  // O container fica sempre na página para o leitor de tela anunciar cada aviso novo
  return (
    <div aria-live="polite" className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} role="status" className={`toast toast-${toast.tipo}`}>
          <span className="toast-icone" aria-hidden="true">
            {toast.tipo === 'erro' ? <CircleAlert size={20} /> : <CircleCheck size={20} />}
          </span>
          <span className="toast-texto">{toast.texto}</span>
          <button type="button" onClick={() => remover(toast.id)} className="toast-fechar" aria-label="Fechar aviso">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
