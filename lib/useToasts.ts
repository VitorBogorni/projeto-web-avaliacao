'use client';

// ==========================================================================
// FRONT · Controle dos avisos (Toast) e aviso para a próxima página.
// ==========================================================================
import { useCallback, useState } from 'react';
import { ToastMessage } from '@/types/cliente';

// Lista de avisos (toasts) que somem sozinhos depois de alguns segundos
export function useToasts(duracaoMs = 4000) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const remover = useCallback((id: string) => {
    setToasts((atuais) => atuais.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (texto: string, tipo: ToastMessage['tipo'] = 'sucesso') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((atuais) => [...atuais, { id, texto, tipo }]);
      setTimeout(() => remover(id), duracaoMs);
    },
    [duracaoMs, remover]
  );

  return { toasts, mostrar, remover };
}

// Aviso para mostrar na próxima página (ex.: depois de cadastrar e voltar para a lista)
const CHAVE_AVISO = 'aviso_proxima_pagina';

export function guardarAviso(texto: string) {
  try {
    sessionStorage.setItem(CHAVE_AVISO, texto);
  } catch {}
}

export function pegarAviso(): string | null {
  try {
    const texto = sessionStorage.getItem(CHAVE_AVISO);
    sessionStorage.removeItem(CHAVE_AVISO);
    return texto;
  } catch {
    return null;
  }
}
