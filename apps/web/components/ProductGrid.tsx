import type { Product } from '@/lib/api';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</section>;
}
