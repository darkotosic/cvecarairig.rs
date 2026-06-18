'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import type { Category } from '@/lib/api';
import { ApiError, createAdminCategory, deleteAdminCategory, getAdminCategories, updateAdminCategory } from '@/lib/api';

function message(error: unknown) { return error instanceof ApiError ? `Admin API greška (${error.status}).` : 'Kategorije trenutno nisu dostupne.'; }

export function AdminCategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => { setLoading(true); setError(null); try { setCategories(await getAdminCategories()); } catch (err) { setError(message(err)); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const visible = useMemo(() => categories.filter((category) => category.name.toLowerCase().includes(query.toLowerCase())), [categories, query]);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(null); setSuccess(null);
    const form = new FormData(event.currentTarget);
    try { await createAdminCategory({ name: String(form.get('name')), slug: String(form.get('slug') || '') || null, sort_order: Number(form.get('sort_order') || 0), is_active: true }); event.currentTarget.reset(); setSuccess('Kategorija je dodata.'); await load(); }
    catch (err) { setError(message(err)); } finally { setSaving(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>, category: Category) {
    event.preventDefault(); setSaving(true); setError(null); setSuccess(null);
    const form = new FormData(event.currentTarget);
    try { await updateAdminCategory(category.id, { name: String(form.get('name')), slug: String(form.get('slug') || '') || null, sort_order: Number(form.get('sort_order') || 0), is_active: form.get('is_active') === 'on' }); setSuccess('Kategorija je sačuvana.'); await load(); }
    catch (err) { setError(message(err)); } finally { setSaving(false); }
  }

  async function deactivate(category: Category) {
    if (!confirm(`Deaktivirati kategoriju "${category.name}"?`)) return;
    setSaving(true); setError(null); setSuccess(null);
    try { await deleteAdminCategory(category.id); setSuccess('Kategorija je deaktivirana.'); await load(); }
    catch (err) { setError(message(err)); } finally { setSaving(false); }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-primary">Kategorije</h2>
      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">{success}</div>}
      <form onSubmit={add} className="grid gap-2 bg-white p-4 md:grid-cols-4"><input name="name" required placeholder="Naziv" className="border px-3 py-2" /><input name="slug" placeholder="Slug" className="border px-3 py-2" /><input name="sort_order" type="number" defaultValue={0} className="border px-3 py-2" /><button disabled={saving} className="bg-primary px-3 py-2 text-white disabled:bg-slate-400">Dodaj</button></form>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pretraga po nazivu" className="w-full border border-slate-300 bg-white px-3 py-2" />
      {loading && <div className="border border-slate-200 bg-white p-6">Učitavanje kategorija...</div>}
      {!loading && visible.length === 0 && <div className="border border-slate-200 bg-white p-6">Nema kategorija za izabranu pretragu.</div>}
      <div className="space-y-2">{visible.map((category) => <form key={category.id} onSubmit={(event) => void save(event, category)} className="grid gap-2 bg-white p-3 md:grid-cols-7"><input name="name" defaultValue={category.name} className="border px-2 py-1" /><input name="slug" defaultValue={category.slug} className="border px-2 py-1" /><input name="sort_order" type="number" defaultValue={category.sort_order} className="border px-2 py-1" /><label><input name="is_active" type="checkbox" defaultChecked={category.is_active} /> active</label><span className={`px-2 py-1 text-center text-xs ${category.is_active ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>{category.is_active ? 'Aktivna' : 'Neaktivna'}</span><button disabled={saving} className="border px-2 py-1">Snimi</button><button type="button" onClick={() => void deactivate(category)} className="border px-2 py-1 text-red-700">Deaktiviraj</button></form>)}</div>
    </section>
  );
}
