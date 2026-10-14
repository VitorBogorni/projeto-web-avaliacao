'use client';

// ==========================================================================
// COMPONENTE · Mesmo card de produto com outro nome (compatibilidade).
// ==========================================================================
import ItemCard from './ItemCard';
import { Produto } from '@/types/item';

interface ClienteCardProps {
  cliente: Produto;
  onExcluir?: (item: Produto) => void;
  onExcluirClick?: (item: Produto) => void;
}

// Compatibilidade: mesmo card de produto com outro nome de propriedade
export default function ClienteCard({ cliente, onExcluirClick, onExcluir }: ClienteCardProps) {
  return <ItemCard item={cliente} onExcluir={onExcluir || onExcluirClick} />;
}
