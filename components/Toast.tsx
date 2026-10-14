'use client';

import { X } from 'lucide-react';
import { ToastMessage } from '@/types/cliente';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove?: (id: string) => void;
  onRemover?: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove, onRemover }: ToastProps) {
  if (toasts.length === 0) return null;

  const handleRemove = (id: string) => {
    if (onRemove) onRemove(id);
    else if (onRemover) onRemover(id);
  };

  return (
    <div aria-live="polite" className="toast-wrapper toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} role="status" className={`toast-box toast toast-${toast.tipo}`}>
          <span>{toast.texto}</span>
          <button
            type="button"
            onClick={() => handleRemove(toast.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
