'use client';

import ItemCard from './ItemCard';
import { Produto } from '@/types/item';

export default function ClienteCard({ cliente, onExcluirClick, onExcluir }: any) {
  return <ItemCard item={cliente as Produto} onExcluir={onExcluir || onExcluirClick} />;
}
