'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/lib/api';
import { AddToCartButton } from './AddToCartButton';
import { Price } from './Price';

function getPrimaryImage(product: Product) {
  const sortedImages = [...(product.images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order || a.id - b.id);
  return sortedImages[0]?.image_url ?? product.image_url;
}

export function ProductCard({ product }: { product: Product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = getPrimaryImage(product);
  const stock = product.effective_stock_quantity ?? product.stock_quantity;
  const hasVariants = product.variants?.some((variant) => variant.is_active) ?? false;
  const hasDiscount = Boolean(product.compare_at_price_cents && product.compare_at_price_cents > product.price_cents);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] bg-slate-100">
        {image && !imageFailed ? (
          <img src={image} alt={`${product.name} - primarna slika proizvoda`} onError={() => setImageFailed(true)} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-6 text-center text-sm font-medium text-slate-500">
            Slika za {product.name} uskoro
          </div>
        )}
        {hasVariants && <span className="absolute left-3 top-3 rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold text-white shadow-sm">Dostupno po varijantama</span>}
        {!hasVariants && stock <= 0 && <span className="absolute left-3 top-3 rounded-full bg-red-700 px-3 py-1 text-xs font-semibold text-white shadow-sm">Nema na stanju</span>}
        {hasDiscount && <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-primary">Sniženo</span>}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-slate-500">{product.category?.name ?? product.sku ?? 'Simeon Shop'}</p>
        <Link href={`/products/${product.slug}`} className="mt-1 text-lg font-semibold text-primary hover:underline">{product.name}</Link>
        {product.short_description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.short_description}</p>}
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <p className="font-bold"><Price cents={product.price_cents} currency={product.currency} /></p>
          {hasDiscount && (
            <p className="text-sm text-slate-500">
              <span className="sr-only">Stara cena </span>
              <span className="line-through"><Price cents={product.compare_at_price_cents ?? 0} currency={product.currency} /></span>
            </p>
          )}
        </div>
        {hasVariants && <p className="mt-2 text-xs font-medium text-slate-500">Dostupne varijante - izaberite veličinu/boju na detalju.</p>}
        <div className="mt-auto pt-4">
          {hasVariants ? <Link href={`/products/${product.slug}`} className="block w-full bg-primary px-4 py-3 text-center text-sm font-semibold text-white">Izaberi varijantu</Link> : <AddToCartButton product={product} />}
        </div>
      </div>
    </article>
  );
}
