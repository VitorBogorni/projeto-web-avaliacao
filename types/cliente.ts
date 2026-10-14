// ==========================================================================
// TIPOS · Formato de um aviso (Toast).
// ==========================================================================
// Mensagem curta exibida pelo componente Toast
export interface ToastMessage {
  id: string;
  texto: string;
  tipo: 'sucesso' | 'erro';
}
