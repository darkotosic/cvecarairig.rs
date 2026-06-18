'use client';

/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import type { AuditLogResponse } from '@/lib/api';
import { ApiError, getAdminAuditLogs } from '@/lib/api';

type Filters = { action: string; entity_type: string; actor_user_id: string };
const initialFilters: Filters = { action: '', entity_type: '', actor_user_id: '' };
const entityTypes = ['product', 'product_image', 'product_variant', 'category', 'order', 'setting'];

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.details && typeof error.details === 'object' && 'detail' in error.details) return String((error.details as { detail?: unknown }).detail);
    return error.status === 401 || error.status === 403 ? 'Sesija je istekla. Prijavite se ponovo.' : `Greška (${error.status}) pri učitavanju audit loga.`;
  }
  return 'Audit log trenutno nije dostupan.';
}

function formatJson(value?: string | null) {
  if (!value) return '{}';
  try { return JSON.stringify(JSON.parse(value), null, 2); } catch { return value; }
}

function PrettyJson({ value }: { value?: string | null }) {
  const formatted = useMemo(() => formatJson(value), [value]);
  return <pre className="max-w-md overflow-x-auto whitespace-pre-wrap font-mono text-xs text-slate-600">{formatted}</pre>;
}

export function AdminAuditLogsPanel() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AuditLogResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pageSize = 25;

  const load = useCallback(async (nextFilters = filters, nextPage = page) => {
    setLoading(true); setError(null); setSuccess(null);
    try {
      const response = await getAdminAuditLogs({
        action: nextFilters.action || undefined,
        entity_type: nextFilters.entity_type || undefined,
        actor_user_id: nextFilters.actor_user_id || undefined,
        page: nextPage,
        page_size: pageSize,
      });
      setData(response);
      setPage(nextPage);
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { void load(initialFilters, 1); }, []);
  useEffect(() => {
    if (!success) return;
    const timeout = window.setTimeout(() => setSuccess(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [success]);

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void load(filters, 1); }
  function reset() { setFilters(initialFilters); setSuccess('Filteri su resetovani.'); void load(initialFilters, 1); }
  async function copyMetadata(value?: string | null) {
    await navigator.clipboard.writeText(formatJson(value));
    setSuccess('Metadata je kopiran.');
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <section className="space-y-4">
      <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-5">
        <input value={filters.action} onChange={(event) => setFilters({ ...filters, action: event.target.value })} placeholder="Action" className="border border-slate-300 px-3 py-2" />
        <select value={filters.entity_type} onChange={(event) => setFilters({ ...filters, entity_type: event.target.value })} className="border border-slate-300 px-3 py-2">
          <option value="">Svi entity tipovi</option>
          {entityTypes.map((entityType) => <option key={entityType} value={entityType}>{entityType}</option>)}
        </select>
        <input value={filters.actor_user_id} onChange={(event) => setFilters({ ...filters, actor_user_id: event.target.value })} placeholder="Actor user ID" className="border border-slate-300 px-3 py-2" />
        <button disabled={loading} className="bg-primary px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-400">Filtriraj</button>
        <button type="button" disabled={loading} onClick={reset} className="border border-slate-300 px-4 py-2 text-sm font-semibold text-primary disabled:text-slate-400">Reset filtera</button>
      </form>
      {loading && <div className="border border-slate-200 bg-white p-6">Učitavanje audit loga...</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">{success}</div>}
      {!loading && data && data.items.length === 0 && <div className="border border-slate-200 bg-white p-6">Nema audit log zapisa za izabrane filtere.</div>}
      {!loading && data && data.items.length > 0 && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr><th className="p-3">Vreme</th><th className="p-3">Actor</th><th className="p-3">Action</th><th className="p-3">Entity</th><th className="p-3">Entity ID</th><th className="p-3">Metadata</th></tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 align-top">
                    <td className="p-3">{new Date(item.created_at).toLocaleString('sr-RS')}</td>
                    <td className="p-3">{item.actor_user_id ?? 'system'}</td>
                    <td className="p-3 font-semibold text-primary">{item.action}</td>
                    <td className="p-3">{item.entity_type}</td>
                    <td className="p-3">{item.entity_id ?? '-'}</td>
                    <td className="p-3">
                      <button type="button" onClick={() => void copyMetadata(item.metadata_json)} className="mb-2 border px-2 py-1 text-xs font-semibold text-primary">Kopiraj metadata</button>
                      <PrettyJson value={item.metadata_json} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 text-sm">
            <button disabled={page <= 1 || loading} onClick={() => void load(filters, page - 1)} className="border px-3 py-1 disabled:text-slate-400">Prethodna</button>
            <span>Strana {page} od {totalPages} · ukupno {data.total}</span>
            <button disabled={page >= totalPages || loading} onClick={() => void load(filters, page + 1)} className="border px-3 py-1 disabled:text-slate-400">Sledeća</button>
          </div>
        </div>
      )}
    </section>
  );
}
