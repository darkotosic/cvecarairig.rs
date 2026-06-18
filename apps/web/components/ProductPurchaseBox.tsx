'use client';

import { useMemo, useState } from 'react';
import type { Product, ProductVariant } from '@/lib/api';
import { Price } from './Price';
import { AddToCartButton } from './AddToCartButton';

const variantLabel = (variant: ProductVariant) => [variant.size, variant.color].filter(Boolean).join(' / ') || variant.sku || `Varijanta ${variant.id}`;
const variantPrice = (product: Product, variant?: ProductVariant) => variant?.price_cents ?? product.price_cents;

export function ProductPurchaseBox({ product }: { product: Product }) {
  const activeVariants = useMemo(() => product.variants.filter((variant) => variant.is_active), [product.variants]);
  const [variantId, setVariantId] = useState<number | ''>('');
  const selectedVariant = activeVariants.find((variant) => variant.id === variantId);
  const requiresVariant = activeVariants.length > 0;
  const stock = requiresVariant ? selectedVariant?.stock_quantity : product.effective_stock_quantity ?? product.stock_quantity;
  const price = variantPrice(product, selectedVariant);
  const sku = selectedVariant?.sku ?? product.sku;
  const selectedOutOfStock = Boolean(selectedVariant && selectedVariant.stock_quantity <= 0);
  const showCompareAt = Boolean(product.compare_at_price_cents && product.compare_at_price_cents > price);

  return (
    <div className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
      <div className="flex flex-wrap items-baseline gap-3">
        <p className="text-2xl font-bold text-slate-950"><Price cents={price} currency={product.currency} /></p>
        {showCompareAt && <p className="text-slate-500"><span className="mr-1 text-xs font-medium uppercase tracking-wide">Pre</span><span className="line-through"><Price cents={product.compare_at_price_cents ?? 0} currency={product.currency} /></span></p>}
      </div>
      {requiresVariant && (
        <label className="block font-medium">
          Dimenzija aranžmana aranžmana / paleta
          <select value={variantId} onChange={(event) => setVariantId(event.target.value ? Number(event.target.value) : '')} className="mt-2 w-full border border-slate-300 px-3 py-3">
            <option value="">Izaberite dimenziju aranžmana / paletu</option>
            {activeVariants.map((variant) => <option key={variant.id} value={variant.id}>{variantLabel(variant)} · {variant.price_cents ? `${(variant.price_cents / 100).toLocaleString('sr-RS')} ${product.currency}` : 'standardna cena'} · {variant.stock_quantity > 0 ? `${variant.stock_quantity} kom.` : 'Nema na stanju'}</option>)}
          </select>
        </label>
      )}
      {requiresVariant && !selectedVariant && <p className="rounded-lg bg-amber-50 p-3 text-amber-800">Izaberite dimenziju aranžmana za dostupnost. Za ovaj proizvod zaliha zavisi od izabrane dimenzije aranžmana/palete.</p>}
      {selectedOutOfStock && <p className="rounded-lg bg-red-50 p-3 font-medium text-red-700">Izabrana varijanta nema na stanju.</p>}
      <p>Stanje: {stock === undefined ? 'Izaberite dimenziju aranžmana za dostupnost' : stock > 0 ? `${stock} komada dostupno` : 'Nema na stanju'}</p>
      {sku && <p>SKU: {sku}</p>}
      <AddToCartButton product={product} selectedVariant={selectedVariant} requiresVariant={requiresVariant} />
    </div>
  );
}
