import Link from 'next/link';
import type { Category } from '@/lib/api';

export function ProductFilters({ categories, searchParams }: { categories: Category[]; searchParams: Record<string, string | undefined> }) {
  return (
    <form className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5" method="get">
      <div>
        <h2 className="font-semibold text-primary">Filteri</h2>
        <p className="mt-1 text-xs text-slate-500">Cene unosite u dinarima (RSD), npr. 1990.</p>
      </div>
      <label className="block text-sm text-slate-700">
        Pretraga
        <input name="q" defaultValue={searchParams.q} className="mt-2 w-full border border-slate-300 px-3 py-2" placeholder="Naziv proizvoda" />
      </label>
      <label className="block text-sm text-slate-700">
        Kategorija
        <select name="category" defaultValue={searchParams.category ?? ''} className="mt-2 w-full border border-slate-300 px-3 py-2">
          <option value="">Sve kategorije</option>
          {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm text-slate-700">
          Min RSD
          <input name="min_price_rsd" type="number" min="0" step="1" inputMode="numeric" defaultValue={searchParams.min_price_rsd} className="mt-2 w-full border border-slate-300 px-3 py-2" placeholder="0" />
        </label>
        <label className="block text-sm text-slate-700">
          Max RSD
          <input name="max_price_rsd" type="number" min="0" step="1" inputMode="numeric" defaultValue={searchParams.max_price_rsd} className="mt-2 w-full border border-slate-300 px-3 py-2" placeholder="5000" />
        </label>
      </div>
      <label className="block text-sm text-slate-700">
        Sortiranje
        <select name="sort" defaultValue={searchParams.sort ?? 'newest'} className="mt-2 w-full border border-slate-300 px-3 py-2">
          <option value="newest">Najnovije</option>
          <option value="price_asc">Cena rastuće</option>
          <option value="price_desc">Cena opadajuće</option>
          <option value="name_asc">Naziv A-Z</option>
          <option value="sort_order">Preporučeno</option>
        </select>
      </label>
      <div className="space-y-2">
        <button className="w-full bg-primary px-4 py-3 text-sm font-semibold text-white">Primeni filtere</button>
        <Link href="/products" className="block w-full border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-primary">Resetuj sve filtere</Link>
      </div>
    </form>
  );
}
