'use client';

/* eslint-disable react-hooks/set-state-in-effect, @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Category, Product } from '@/lib/api';
import { ApiError, createAdminProduct, deleteAdminProduct, getAdminCategories, getAdminProducts, updateAdminProduct } from '@/lib/api';
import { AdminProductForm } from './AdminProductForm';
import { AdminProductImages } from './AdminProductImages';
import { AdminProductVariants } from './AdminProductVariants';

function message(error: unknown) {
  if (error instanceof ApiError) return `Admin API greška (${error.status}).`;
  return 'Proizvodi trenutno nisu dostupni.';
}

export function AdminProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Temporary: admin product management fetches first 100 rows; client-side search/filter stays local until server pagination UI is added.
      const [productData, categoryData] = await Promise.all([getAdminProducts({ page_size: 100 }), getAdminCategories()]);
      setProducts(productData.items);
      setCategories(categoryData);
    } catch (err) {
      setError(message(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!success) return;
    const timeout = window.setTimeout(() => setSuccess(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [success]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const activeMatches = activeFilter === 'all' || (activeFilter === 'active' ? product.is_active : !product.is_active);
      const textMatches = !needle || [product.name, product.slug, product.sku ?? ''].some((value) => value.toLowerCase().includes(needle));
      return activeMatches && textMatches;
    });
  }, [activeFilter, products, query]);

  async function saveProduct(payload: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editing) {
        await updateAdminProduct(editing.id, payload);
        setSuccess('Proizvod je sačuvan.');
      } else {
        await createAdminProduct(payload);
        setSuccess('Novi proizvod je dodat.');
      }
      setEditing(null);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(message(err));
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(product: Product) {
    if (!confirm(`Deaktivirati proizvod "${product.name}"?`)) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteAdminProduct(product.id);
      setSuccess('Proizvod je deaktiviran.');
      await load();
    } catch (err) {
      setError(message(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-primary">Proizvodi</h2>
        <button type="button" onClick={() => { setEditing(null); setShowForm(true); }} className="bg-primary px-4 py-2 text-sm font-semibold text-white">Novi proizvod</button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto]">
        <p className="text-xs text-slate-500 md:col-span-2">Privremeno se učitava do 100 proizvoda po zahtevu; pretraga i filter su client-side. Ako proizvod ima aktivne varijante, effective stock se računa iz varijanti.</p>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pretraga po nazivu, slug-u ili SKU" className="border border-slate-300 px-3 py-2" />
        <select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value as 'all' | 'active' | 'inactive')} className="border border-slate-300 px-3 py-2">
          <option value="all">Svi proizvodi</option>
          <option value="active">Aktivni</option>
          <option value="inactive">Neaktivni</option>
        </select>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">{success}</div>}
      {(showForm || editing) && <AdminProductForm categories={categories} product={editing} saving={saving} error={error} success={success} onSubmit={saveProduct} />}
      {loading && <div className="border border-slate-200 bg-white p-6">Učitavanje proizvoda...</div>}
      {!loading && filtered.length === 0 && <div className="border border-slate-200 bg-white p-6">Nema proizvoda za izabranu pretragu.</div>}

      <div className="space-y-4">
        {filtered.map((product) => {
          const activeVariants = product.variants.filter((variant) => variant.is_active);
          const baseStock = product.stock_quantity;
          const variantStock = activeVariants.reduce((sum, variant) => sum + variant.stock_quantity, 0);
          const stock = product.effective_stock_quantity ?? (activeVariants.length > 0 ? variantStock : baseStock);
          const primaryImage = product.images.find((image) => image.is_primary) ?? product.images[0];
          return (
            <article key={product.id} className="space-y-3 border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {primaryImage?.image_url ? <img src={primaryImage.image_url} alt={primaryImage.alt_text ?? product.name} className="h-14 w-14 rounded-xl object-cover" loading="lazy" /> : <div className="h-14 w-14 rounded-xl bg-slate-100" />}
                  <div className="min-w-0">
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="truncate text-sm text-slate-500">{product.slug} · {product.sku ?? 'bez SKU'}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="bg-slate-100 px-2 py-1 text-slate-700">Base stock: {baseStock}</span>
                      <span className="bg-slate-100 px-2 py-1 text-slate-700">Variant total stock: {variantStock}</span>
                      <span className={`px-2 py-1 ${stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>Effective stock: {stock}</span>
                      <span className={`px-2 py-1 ${product.is_active ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>{product.is_active ? 'Aktivan' : 'Neaktivan'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={saving} onClick={() => { setEditing(product); setShowForm(true); }} className="border px-3 py-2 disabled:text-slate-400">Izmeni</button>
                  <button type="button" disabled={saving} onClick={() => void deactivate(product)} className="border px-3 py-2 text-red-700 disabled:text-slate-400">Deaktiviraj</button>
                </div>
              </div>
              <AdminProductImages product={product} onChanged={load} />
              <AdminProductVariants product={product} onChanged={load} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
