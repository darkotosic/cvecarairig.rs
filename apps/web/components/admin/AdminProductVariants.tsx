'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { Product, ProductVariant } from '@/lib/api';
import { ApiError, createAdminProductVariant, deleteAdminProductVariant, updateAdminProductVariant } from '@/lib/api';

const toCents = (value: FormDataEntryValue | null) => value ? Math.round(Number(String(value).replace(',', '.')) * 100) : null;
const toRsd = (value?: number | null) => value ? String(value / 100) : '';

function detail(error: unknown) {
  if (error instanceof ApiError) {
    if (error.details && typeof error.details === 'object' && 'detail' in error.details) {
      return String((error.details as { detail?: unknown }).detail);
    }
    return `Greška (${error.status}) pri čuvanju varijante.`;
  }
  return 'Varijanta nije sačuvana.';
}

type VariantPayload = {
  size: string | null;
  color: string | null;
  sku: string | null;
  price_cents: number | null;
  stock_quantity: number;
  is_active: boolean;
};

function payloadFromForm(form: FormData, isActive: boolean): VariantPayload {
  return {
    size: String(form.get('size') || '') || null,
    color: String(form.get('color') || '') || null,
    sku: String(form.get('sku') || '') || null,
    price_cents: toCents(form.get('price')),
    stock_quantity: Number(form.get('stock_quantity') || 0),
    is_active: isActive,
  };
}

function VariantCreateForm({ saving, onSubmit }: { saving: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-2 rounded-2xl bg-slate-50 p-3 md:grid-cols-6">
      <label className="text-xs font-semibold text-slate-600">Veličina<input name="size" className="mt-1 w-full border px-2 py-2" /></label>
      <label className="text-xs font-semibold text-slate-600">Boja<input name="color" className="mt-1 w-full border px-2 py-2" /></label>
      <label className="text-xs font-semibold text-slate-600">SKU<input name="sku" className="mt-1 w-full border px-2 py-2" /></label>
      <label className="text-xs font-semibold text-slate-600">Cena RSD<input name="price" type="number" step="0.01" min="0" className="mt-1 w-full border px-2 py-2" /></label>
      <label className="text-xs font-semibold text-slate-600">Zalihe<input name="stock_quantity" type="number" min="0" defaultValue={0} className="mt-1 w-full border px-2 py-2" /></label>
      <button disabled={saving} className="self-end bg-primary px-3 py-2 text-white disabled:bg-slate-400">Dodaj</button>
    </form>
  );
}

function VariantRow({ variant, saving, onSave, onDeactivate }: { variant: ProductVariant; saving: boolean; onSave: (event: FormEvent<HTMLFormElement>) => void; onDeactivate: () => void }) {
  return (
    <form onSubmit={onSave} className="grid gap-2 rounded-xl border border-slate-100 p-2 text-sm md:grid-cols-8">
      <label className="text-xs font-semibold text-slate-600">Veličina<input name="size" defaultValue={variant.size ?? ''} className="mt-1 w-full border px-2 py-1" /></label>
      <label className="text-xs font-semibold text-slate-600">Boja<input name="color" defaultValue={variant.color ?? ''} className="mt-1 w-full border px-2 py-1" /></label>
      <label className="text-xs font-semibold text-slate-600">SKU<input name="sku" defaultValue={variant.sku ?? ''} className="mt-1 w-full border px-2 py-1" /></label>
      <label className="text-xs font-semibold text-slate-600">Cena RSD<input name="price" type="number" step="0.01" min="0" defaultValue={toRsd(variant.price_cents)} className="mt-1 w-full border px-2 py-1" /></label>
      <label className="text-xs font-semibold text-slate-600">Zalihe<input name="stock_quantity" type="number" min="0" defaultValue={variant.stock_quantity} className="mt-1 w-full border px-2 py-1" /></label>
      <label className="flex items-center gap-1 self-end"><input name="is_active" type="checkbox" defaultChecked={variant.is_active} /> Aktivna</label>
      <span className={`self-end px-2 py-1 text-center ${variant.is_active ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>{variant.is_active ? 'Aktivna' : 'Neaktivna'}</span>
      <span className="flex gap-2 self-end">
        <button disabled={saving} className="border px-2 py-1 disabled:text-slate-400">Snimi</button>
        <button type="button" disabled={saving} onClick={onDeactivate} className="border px-2 py-1 text-red-700 disabled:text-slate-400">Deaktiviraj</button>
      </span>
    </form>
  );
}

export function AdminProductVariants({ product, onChanged }: { product: Product; onChanged: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock_quantity, 0);

  useEffect(() => {
    if (!success) return;
    const timeout = window.setTimeout(() => setSuccess(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [success]);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = payloadFromForm(form, true);
    if (payload.stock_quantity < 0) { setError('Zalihe ne mogu biti negativne.'); return; }
    setSaving(true); setError(null); setSuccess(null);
    try {
      await createAdminProductVariant(product.id, payload);
      event.currentTarget.reset();
      setSuccess('Varijanta je dodata.');
      await onChanged();
    } catch (err) { setError(detail(err)); }
    finally { setSaving(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>, variantId: number) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = payloadFromForm(form, form.get('is_active') === 'on');
    if (payload.stock_quantity < 0) { setError('Zalihe ne mogu biti negativne.'); return; }
    setSaving(true); setError(null); setSuccess(null);
    try {
      await updateAdminProductVariant(product.id, variantId, payload);
      setSuccess('Varijanta je sačuvana.');
      await onChanged();
    } catch (err) { setError(detail(err)); }
    finally { setSaving(false); }
  }

  async function deactivate(variantId: number) {
    if (!confirm('Deaktivirati varijantu?')) return;
    setSaving(true); setError(null); setSuccess(null);
    try {
      await deleteAdminProductVariant(product.id, variantId);
      setSuccess('Varijanta je deaktivirana.');
      await onChanged();
    } catch (err) { setError(detail(err)); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-3 border border-slate-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold">Varijante</h4>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Ukupno zaliha: {totalStock}</span>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {success && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</p>}
      <VariantCreateForm saving={saving} onSubmit={(event) => void add(event)} />
      {product.variants.length === 0 && <p className="text-sm text-slate-500">Nema varijanti.</p>}
      <div className="space-y-2">
        {product.variants.map((variant) => (
          <VariantRow
            key={variant.id}
            variant={variant}
            saving={saving}
            onSave={(event) => void save(event, variant.id)}
            onDeactivate={() => void deactivate(variant.id)}
          />
        ))}
      </div>
    </div>
  );
}
