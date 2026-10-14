// Mensagem curta exibida pelo componente Toast
export interface ToastMessage {
  id: string;
  texto: string;
  tipo: 'sucesso' | 'erro';
}
