import type { CartLine, Product, ProductVariant } from './api';

const CART_KEY = 'cvecarairig.cart.v1';

function primaryImageUrl(product: Product) {
  const images = [...(product.images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order || a.id - b.id);
  return images[0]?.image_url ?? product.image_url;
}

export function getCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as CartLine[]; } catch { return []; }
}
export function saveCart(lines: CartLine[]) { if (typeof window !== 'undefined') localStorage.setItem(CART_KEY, JSON.stringify(lines)); }
export function addToCart(product: Product, variant?: ProductVariant, quantity = 1) {
  const lines = getCart();
  const variantLabel = variant ? [variant.size, variant.color].filter(Boolean).join(' / ') : undefined;
  const lineId = `${product.id}:${variant?.id ?? 'base'}`;
  const existing = lines.find((line) => line.lineId === lineId);
  const stockQuantity = variant?.stock_quantity ?? product.effective_stock_quantity ?? product.stock_quantity;
  if (existing) existing.quantity = Math.min(existing.quantity + quantity, stockQuantity);
  else lines.push({ lineId, productId: product.id, variantId: variant?.id, name: product.name, slug: product.slug, imageUrl: primaryImageUrl(product), sku: variant?.sku ?? product.sku, variantLabel, unitPriceCents: variant?.price_cents ?? product.price_cents, quantity: Math.min(quantity, stockQuantity), stockQuantity, currency: product.currency });
  saveCart(lines);
  window.dispatchEvent(new Event('cvecarairig:cart'));
}
export function updateCartLine(lineId: string, quantity: number) { const lines = getCart().map((line) => line.lineId === lineId ? { ...line, quantity: Math.min(Math.max(quantity, 1), line.stockQuantity) } : line); saveCart(lines); window.dispatchEvent(new Event('cvecarairig:cart')); }
export function removeCartLine(lineId: string) { saveCart(getCart().filter((line) => line.lineId !== lineId)); window.dispatchEvent(new Event('cvecarairig:cart')); }
export function clearCart() { saveCart([]); window.dispatchEvent(new Event('cvecarairig:cart')); }
export function getCartTotalCents() { return getCart().reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0); }
