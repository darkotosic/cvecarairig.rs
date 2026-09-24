import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';
export function ProductGrid({ products }: { products: Product[]; phone?: string | null }) { return products.length ? <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((p) => <ProductCard key={p.id} product={p} />)}</section> : null; }
