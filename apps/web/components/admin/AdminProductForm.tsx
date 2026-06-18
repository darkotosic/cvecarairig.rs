'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { FormEvent, useEffect, useState } from 'react';
import type { Category, Product } from '@/lib/api';

const centsToRsd = (cents?: number | null) => (cents ? String(cents / 100) : '');
const toNumber = (value: FormDataEntryValue | null) => Number(String(value ?? '').replace(',', '.'));
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const input = 'mt-1 w-full border border-slate-300 px-3 py-2';

export function AdminProductForm({
  product,
  categories,
  saving = false,
  success,
  error,
  onSubmit,
}: {
  product?: Product | null;
  categories: Category[];
  saving?: boolean;
  success?: string | null;
  error?: string | null;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [seoTitle, setSeoTitle] = useState(product?.seo_title ?? '');
  const [seoDescription, setSeoDescription] = useState(product?.seo_description ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setName(product?.name ?? '');
    setSlug(product?.slug ?? '');
    setSeoTitle(product?.seo_title ?? '');
    setSeoDescription(product?.seo_description ?? '');
    setValidationError(null);
  }, [product]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    const form = new FormData(event.currentTarget);
    const price = toNumber(form.get('price'));
    const compareAtPrice = form.get('compare_at_price') ? toNumber(form.get('compare_at_price')) : null;
    const stockQuantity = Number(form.get('stock_quantity') || 0);

    if (!Number.isFinite(price) || price <= 0) {
      setValidationError('Cena u RSD mora biti pozitivan broj.');
      return;
    }
    if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)) {
      setValidationError('Compare-at cena mora biti pozitivan broj ili prazna.');
      return;
    }
    if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
      setValidationError('Zalihe ne mogu biti negativne.');
      return;
    }

    await onSubmit({
      name: String(form.get('name') || ''),
      slug: String(form.get('slug') || '') || null,
      sku: String(form.get('sku') || '') || null,
      category_id: form.get('category_id') ? Number(form.get('category_id')) : null,
      short_description: String(form.get('short_description') || '') || null,
      description: String(form.get('description') || '') || null,
      price_cents: Math.round(price * 100),
      compare_at_price_cents: compareAtPrice === null ? null : Math.round(compareAtPrice * 100),
      image_url: String(form.get('image_url') || '') || null,
      material: String(form.get('material') || '') || null,
      care_instructions: String(form.get('care_instructions') || '') || null,
      arrangement_type: String(form.get('arrangement_type') || '') || null,
      occasion: String(form.get('occasion') || '') || null,
      color_palette: String(form.get('color_palette') || '') || null,
      flower_count: form.get('flower_count') ? Number(form.get('flower_count')) : null,
      is_same_day_delivery: form.get('is_same_day_delivery') === 'on',
      lead_time_hours: Number(form.get('lead_time_hours') || 2),
      seo_title: String(form.get('seo_title') || '') || null,
      seo_description: String(form.get('seo_description') || '') || null,
      sort_order: Number(form.get('sort_order') || 0),
      stock_quantity: stockQuantity,
      is_active: form.get('is_active') === 'on',
      currency: 'RSD',
    });

    if (!product) event.currentTarget.reset();
  }

  const previewSlug = slug || slugify(name);

  return (
    <form onSubmit={submit} className="space-y-5 border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-primary">{product ? 'Izmena proizvoda' : 'Novi proizvod'}</h3>
        <button disabled={saving} className="bg-primary px-4 py-2 font-semibold text-white disabled:bg-slate-400">
          {saving ? 'Čuvanje...' : product ? 'Sačuvaj proizvod' : 'Dodaj proizvod'}
        </button>
      </div>
      {(validationError || error) && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{validationError || error}</p>}
      {success && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</p>}

      <fieldset className="grid gap-3 md:grid-cols-2">
        <legend className="mb-2 font-semibold text-slate-900">Osnovno</legend>
        <label className="text-sm font-medium">Naziv<input name="name" required value={name} onChange={(event) => setName(event.target.value)} className={input} /></label>
        <label className="text-sm font-medium">Slug<input name="slug" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder={slugify(name)} className={input} /></label>
        <p className="text-xs text-slate-500 md:col-span-2">Slug preview: <span className="font-mono">{previewSlug || 'unesite naziv proizvoda'}</span></p>
        <label className="text-sm font-medium">SKU<input name="sku" defaultValue={product?.sku ?? ''} className={input} /></label>
        <label className="text-sm font-medium">Sort order<input name="sort_order" type="number" defaultValue={product?.sort_order ?? 0} className={input} /></label>
        <label className="text-sm font-medium md:col-span-2">Kratak opis<textarea name="short_description" defaultValue={product?.short_description ?? ''} className={input} /></label>
        <label className="text-sm font-medium md:col-span-2">Pun opis<textarea name="description" defaultValue={product?.description ?? ''} className={input} /></label>
      </fieldset>

      <fieldset className="grid gap-3 md:grid-cols-2">
        <legend className="mb-2 font-semibold text-slate-900">Kategorija</legend>
        <label className="text-sm font-medium">Kategorija<select name="category_id" defaultValue={product?.category_id ?? ''} className={input}><option value="">Bez kategorije</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="mt-7 flex items-center gap-2 text-sm"><input name="is_active" type="checkbox" defaultChecked={product?.is_active ?? true} /> Aktivan proizvod</label>
      </fieldset>

      <fieldset className="grid gap-3 md:grid-cols-3">
        <legend className="mb-2 font-semibold text-slate-900">Cena i zalihe</legend>
        <label className="text-sm font-medium">Cena RSD<input name="price" type="number" step="0.01" min="0" required defaultValue={centsToRsd(product?.price_cents)} className={input} /></label>
        <label className="text-sm font-medium">Compare-at cena RSD<input name="compare_at_price" type="number" step="0.01" min="0" defaultValue={centsToRsd(product?.compare_at_price_cents)} className={input} /></label>
        <label className="text-sm font-medium">Zalihe<input name="stock_quantity" type="number" min="0" defaultValue={product?.stock_quantity ?? 0} className={input} /></label>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-semibold text-slate-900">Fallback slika</legend>
        <label className="text-sm font-medium">Image URL<input name="image_url" type="url" defaultValue={product?.image_url ?? ''} className={input} /></label>
      </fieldset>

      <fieldset className="grid gap-3 md:grid-cols-2">
        <legend className="mb-2 font-semibold text-slate-900">SEO</legend>
        <label className="text-sm font-medium">SEO title<input name="seo_title" value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} className={input} /><span className="text-xs text-slate-500">{seoTitle.length}/60 preporučeno</span></label>
        <label className="text-sm font-medium">SEO description<textarea name="seo_description" value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} className={input} /><span className="text-xs text-slate-500">{seoDescription.length}/160 preporučeno</span></label>
      </fieldset>

      <fieldset className="grid gap-3 md:grid-cols-2">
        <legend className="mb-2 font-semibold text-slate-900">Cvećarski detalji</legend>
        <label className="text-sm font-medium">Sastav aranžmana<input name="material" defaultValue={product?.material ?? ''} className={input} /></label>
        <label className="text-sm font-medium">Instrukcije za negu<input name="care_instructions" defaultValue={product?.care_instructions ?? ''} className={input} /></label>
      <label className="text-sm font-medium">Tip aranžmana<input name="arrangement_type" defaultValue={product?.arrangement_type ?? ''} placeholder="buket, flower box, korpa, ruže" className={input} /></label>
        <label className="text-sm font-medium">Prilika<input name="occasion" defaultValue={product?.occasion ?? ''} placeholder="rođendan, godišnjica, slava" className={input} /></label>
        <label className="text-sm font-medium">Paleta boja<input name="color_palette" defaultValue={product?.color_palette ?? ''} className={input} /></label>
        <label className="text-sm font-medium">Broj cvetova<input name="flower_count" type="number" min="0" defaultValue={product?.flower_count ?? ''} className={input} /></label>
        <label className="flex items-center gap-2 text-sm"><input name="is_same_day_delivery" type="checkbox" defaultChecked={product?.is_same_day_delivery ?? true} /> Dostava istog dana</label>
        <label className="text-sm font-medium">Vreme pripreme u satima<input name="lead_time_hours" type="number" min="0" defaultValue={product?.lead_time_hours ?? 2} className={input} /></label>
      </fieldset>
    </form>
  );
}
