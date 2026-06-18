'use client';

import { useState } from 'react';
import type { Product, ProductVariant } from '@/lib/api';
import { addToCart } from '@/lib/cart';

export function AddToCartButton({ product, selectedVariant, requiresVariant = false }: { product: Product; selectedVariant?: ProductVariant; requiresVariant?: boolean }) {
  const [added, setAdded] = useState(false);
  const stock = selectedVariant?.stock_quantity ?? product.effective_stock_quantity ?? product.stock_quantity;
  const disabled = stock <= 0 || (requiresVariant && !selectedVariant);

  return (
    <div className="space-y-2">
      <button
        disabled={disabled}
        onClick={() => {
          addToCart(product, selectedVariant, 1);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1800);
        }}
        className="w-full bg-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {stock <= 0 ? 'Nema na stanju' : requiresVariant && !selectedVariant ? 'Izaberite veličinu/boju' : 'Dodaj u korpu'}
      </button>
      {added && <p className="text-sm font-medium text-green-700">Dodato u korpu</p>}
    </div>
  );
}
