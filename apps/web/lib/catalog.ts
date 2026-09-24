import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import type { Category, Product } from './types';

const products = productsData as Product[];
const categories = categoriesData as Category[];
export const getAllProducts = () => [...products].sort((a, b) => a.sortOrder - b.sortOrder);
export const getActiveProducts = () => getAllProducts().filter((product) => product.active);
export const getFeaturedProducts = () => getActiveProducts().filter((product) => product.featured);
export const getProductBySlug = (slug: string) => getActiveProducts().find((product) => product.slug === slug);
export const getCategories = () => [...categories].filter((category) => category.active).sort((a, b) => a.sortOrder - b.sortOrder);
export const getCategoryById = (id: string) => categories.find((category) => category.id === id);
export const getProductsByCategory = (categoryId: string) => getActiveProducts().filter((product) => product.categoryId === categoryId);
export type ProductSort = 'recommended' | 'price_asc' | 'price_desc' | 'name_asc';
export function filterProducts(items: Product[], options: { query?: string; categoryId?: string; minPrice?: number; maxPrice?: number }) {
  const query = options.query?.trim().toLocaleLowerCase('sr') ?? '';
  return items.filter((product) => (!query || `${product.name} ${product.shortDescription} ${product.sku}`.toLocaleLowerCase('sr').includes(query)) && (!options.categoryId || product.categoryId === options.categoryId) && (options.minPrice === undefined || product.priceRsd === null || product.priceRsd >= options.minPrice) && (options.maxPrice === undefined || product.priceRsd === null || product.priceRsd <= options.maxPrice));
}
export function sortProducts(items: Product[], sort: ProductSort) {
  return [...items].sort((a, b) => sort === 'name_asc' ? a.name.localeCompare(b.name, 'sr') : sort === 'price_asc' ? (a.priceRsd ?? Infinity) - (b.priceRsd ?? Infinity) : sort === 'price_desc' ? (b.priceRsd ?? -Infinity) - (a.priceRsd ?? -Infinity) : a.sortOrder - b.sortOrder);
}
