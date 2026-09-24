/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { getCategoryById } from '@/lib/catalog';
import { CallToOrderButton } from './CallToOrderButton';
import { Price } from './Price';
export function ProductCard({ product }: { product: Product; phone?: string | null }) {
 const category = getCategoryById(product.categoryId);
 const discount = product.compareAtPriceRsd != null && product.compareAtPriceRsd > product.priceRsd;
 return <article className="flex overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
  <div className="flex w-full flex-col"><Link href={`/products/${product.slug}`} className="relative block overflow-hidden"><img src={product.image} alt={`${product.name} — cvetni aranžman`} width="1254" height="1254" loading="lazy" decoding="async" className="aspect-square w-full bg-slate-100 object-cover" />{discount && <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-primary">Sniženo</span>}</Link>
  <div className="flex flex-1 flex-col p-5"><p className="text-sm text-slate-500">{category?.name ?? product.sku}</p><Link href={`/products/${product.slug}`} className="mt-1 text-lg font-semibold text-primary hover:underline">{product.name}</Link><p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.shortDescription}</p><div className="mt-3 flex gap-2 font-bold"><Price value={product.priceRsd} />{discount && <span className="text-sm font-normal text-slate-500 line-through"><Price value={product.compareAtPriceRsd!} /></span>}</div><div className="mt-auto pt-4"><CallToOrderButton productName={product.name} /></div></div></div>
 </article>;
}
