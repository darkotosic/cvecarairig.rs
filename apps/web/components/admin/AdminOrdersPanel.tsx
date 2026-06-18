'use client';

/* eslint-disable react-hooks/set-state-in-effect, @next/next/no-img-element */

import { Fragment, useCallback, useEffect, useState } from 'react';
import type { Order } from '@/lib/api';
import { ApiError, exportAdminOrdersCsv, getAdminOrders, updateAdminOrderInternalNote, updateAdminOrderStatus } from '@/lib/api';
import { Price } from '../Price';

const statuses = ['new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'] as const;
type OrderStatus = (typeof statuses)[number];

const allowedNextStatuses: Record<OrderStatus, OrderStatus[]> = {
  new: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

function isOrderStatus(status: string): status is OrderStatus {
  return statuses.includes(status as OrderStatus);
}

function apiErrorDetail(details: unknown) {
  if (details && typeof details === 'object' && 'detail' in details) {
    const detail = (details as { detail?: unknown }).detail;
    if (typeof detail === 'string') return detail;
  }
  return null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return apiErrorDetail(error.details) ?? `Admin API greška (${error.status}).`;
  return 'Porudžbine trenutno nisu dostupne.';
}

function OrderStatusSelect({ order, saving, onChange }: { order: Order; saving: boolean; onChange: (status: string) => void }) {
  const currentStatus = isOrderStatus(order.status) ? order.status : 'new';
  const nextStatuses = allowedNextStatuses[currentStatus];
  const isLocked = nextStatuses.length === 0;

  return (
    <div className="space-y-1">
      <select
        disabled={saving || isLocked}
        value={order.status}
        onChange={(event) => onChange(event.target.value)}
        className="border px-2 py-1 disabled:bg-slate-100 disabled:text-slate-500"
      >
        <option value={order.status}>{order.status}</option>
        {nextStatuses.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
      {isLocked && <p className="text-xs font-medium text-slate-500">Zaključano</p>}
    </div>
  );
}

function OrderItems({ order }: { order: Order }) {
  return (
    <ul className="space-y-2">
      {order.items.map((item) => (
        <li key={item.id} className="flex gap-2">
          {item.product_image_url && (
            <img src={item.product_image_url} alt={item.product_name} className="h-10 w-10 object-cover" loading="lazy" />
          )}
          <span>
            {item.product_name}
            {item.variant_label ? ` • ${item.variant_label}` : ''} × {item.quantity}
          </span>
        </li>
      ))}
    </ul>
  );
}

function OrderInternalNoteEditor({ value, saving, onChange, onSave }: { value: string; saving: boolean; onChange: (value: string) => void; onSave: () => void }) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-20 w-56 border border-slate-300 p-2"
        placeholder="Napomena samo za admin tim"
      />
      <button type="button" disabled={saving} onClick={onSave} className="mt-2 block border px-2 py-1 text-xs disabled:text-slate-400">
        {saving ? 'Čuvanje...' : 'Sačuvaj napomenu'}
      </button>
    </div>
  );
}

function OrderDetails({ order }: { order: Order }) {
  return (
    <tr className="border-b bg-slate-50 align-top">
      <td colSpan={7} className="p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h4 className="font-semibold">Dostava</h4>
            <p>{order.shipping_address}</p>
            <p>{order.shipping_postal_code} {order.shipping_city}</p>
            <p className="mt-2"><strong>Primalac:</strong> {order.recipient_name || 'isti kao kupac'} {order.recipient_phone ? `• ${order.recipient_phone}` : ''}</p>
            <p><strong>Datum/termin:</strong> {order.delivery_date || '-'} {order.delivery_time_window ? `• ${order.delivery_time_window}` : ''}</p>
            <p><strong>Prilika:</strong> {order.occasion || '-'}</p>
            <p><strong>Poruka za karticu:</strong> {order.card_message || '-'}</p>
            <p className="mt-2 text-xs text-slate-500">
              Accepted terms: {order.accepted_terms_at ? new Date(order.accepted_terms_at).toLocaleString('sr-RS') : '-'}
            </p>
            <p className="text-xs text-slate-500">Source: {order.source ?? '-'}</p>
          </div>
          <div>
            <h4 className="font-semibold">Status timeline</h4>
            <ol className="space-y-1">
              {(order.status_events ?? []).map((event) => (
                <li key={event.id} className="text-xs">
                  <span className="font-semibold">{event.new_status}</span> · {new Date(event.created_at).toLocaleString('sr-RS')}
                  {event.note ? ` · ${event.note}` : ''}
                </li>
              ))}
              {(!order.status_events || order.status_events.length === 0) && <li className="text-xs text-slate-500">Nema status događaja.</li>}
            </ol>
          </div>
          <details>
            <summary className="cursor-pointer font-semibold">Advanced</summary>
            <p className="mt-2 break-all text-xs text-slate-600">IP: {order.customer_ip ?? '-'}</p>
            <p className="break-all text-xs text-slate-600">User agent: {order.user_agent ?? '-'}</p>
            <p className="break-all text-xs text-slate-600">Idempotency: {order.idempotency_key ?? '-'}</p>
          </details>
        </div>
      </td>
    </tr>
  );
}

function OrderRow({ order, expanded, note, saving, onToggle, onNoteChange, onSaveNote, onStatusChange }: { order: Order; expanded: boolean; note: string; saving: boolean; onToggle: () => void; onNoteChange: (value: string) => void; onSaveNote: () => void; onStatusChange: (status: string) => void }) {
  return (
    <Fragment>
      <tr className="border-b align-top">
        <td className="p-3 font-medium">{order.order_number}</td>
        <td>
          {order.customer_name}<br />
          <span className="text-slate-500">{order.customer_email || 'bez email-a'} · {order.customer_phone}</span>
        </td>
        <td><OrderStatusSelect order={order} saving={saving} onChange={onStatusChange} /></td>
        <td><OrderItems order={order} /></td>
        <td><OrderInternalNoteEditor value={note} saving={saving} onChange={onNoteChange} onSave={onSaveNote} /></td>
        <td><Price cents={order.total_cents} currency={order.currency} /></td>
        <td>
          <button type="button" onClick={onToggle} className="border px-2 py-1">
            {expanded ? 'Sakrij' : 'Detalji'}
          </button>
        </td>
      </tr>
      {expanded && <OrderDetails order={order} />}
    </Fragment>
  );
}

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportWarning, setExportWarning] = useState<string | null>(null);

  const dateRangeError = dateFrom && dateTo && dateFrom > dateTo ? 'Datum od ne može biti posle datuma do.' : null;

  const load = useCallback(async () => {
    if (dateRangeError) {
      setOrders([]);
      setTotal(0);
      setPages(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminOrders({ page, page_size: pageSize, status: filter, date_from: dateFrom, date_to: dateTo, q: search });
      setOrders(data.items);
      setTotal(data.total);
      setPages(data.pages);
      setNotes(Object.fromEntries(data.items.map((order) => [order.id, order.internal_note ?? ''])));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateRangeError, dateTo, filter, page, pageSize, search]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setExpandedId(null);
      setSearch(searchInput);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);
  useEffect(() => {
    if (!success) return;
    const timeout = window.setTimeout(() => setSuccess(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [success]);

  function resetToFirstPage(callback: () => void) {
    setPage(1);
    setExpandedId(null);
    callback();
  }

  function resetFilters() {
    setFilter('');
    setDateFrom('');
    setDateTo('');
    setSearchInput('');
    setSearch('');
    setPage(1);
    setPageSize(25);
    setExpandedId(null);
    setExportWarning(null);
    setError(null);
  }

  async function saveNote(order: Order) {
    setSavingId(order.id); setError(null); setSuccess(null); setExportWarning(null);
    try {
      await updateAdminOrderInternalNote(order.id, notes[order.id] || null);
      setSuccess('Interna napomena je sačuvana.');
      await load();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSavingId(null); }
  }

  async function changeStatus(order: Order, status: string) {
    if (status === order.status) return;
    if (status === 'cancelled' && !confirm('Da li sigurno otkazujete porudžbinu?')) return;
    setSavingId(order.id); setError(null); setSuccess(null); setExportWarning(null);
    try {
      await updateAdminOrderStatus(order.id, status);
      setSuccess('Status porudžbine je ažuriran.');
      await load();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSavingId(null); }
  }


  async function exportCsv() {
    if (dateRangeError) {
      setError(dateRangeError);
      setSuccess(null);
      setExportWarning(null);
      return;
    }
    setExporting(true);
    setError(null);
    setSuccess(null);
    setExportWarning(null);
    try {
      const result = await exportAdminOrdersCsv({ status: filter, date_from: dateFrom, date_to: dateTo });
      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccess('CSV izvoz je spreman za preuzimanje.');
      if (result.truncated) {
        setExportWarning(`Export je ograničen na prvih ${result.rows} redova. Suzite status ili datumski filter za kompletan izvoz.`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-primary">Porudžbine</h2>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-medium text-slate-600">
            Pretraga
            <input type="search" value={searchInput} onChange={(event) => resetToFirstPage(() => setSearchInput(event.target.value))} placeholder="Broj, kupac, email..." className="mt-1 block border px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-600">
            Status
            <select value={filter} onChange={(event) => resetToFirstPage(() => setFilter(event.target.value))} className="mt-1 block border px-3 py-2 text-sm">
              <option value="">Svi statusi</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600">
            Od
            <input type="date" value={dateFrom} onChange={(event) => resetToFirstPage(() => setDateFrom(event.target.value))} className="mt-1 block border px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-600">
            Do
            <input type="date" value={dateTo} onChange={(event) => resetToFirstPage(() => setDateTo(event.target.value))} className="mt-1 block border px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-600">
            Po strani
            <select value={pageSize} onChange={(event) => resetToFirstPage(() => setPageSize(Number(event.target.value)))} className="mt-1 block border px-3 py-2 text-sm">
              {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <button type="button" onClick={resetFilters} className="border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Resetuj filtere
          </button>
          <button type="button" disabled={exporting || Boolean(dateRangeError)} onClick={() => void exportCsv()} className="bg-primary px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-400">
            {exporting ? 'Export...' : 'Export CSV'}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
        <span>Strana {page} od {pages} — ukupno {total} porudžbina</span>
        <div className="flex gap-2">
          <button type="button" disabled={loading || page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="border px-3 py-1 disabled:text-slate-400">Prethodna</button>
          <button type="button" disabled={loading || page >= pages || orders.length === 0} onClick={() => setPage((current) => Math.min(pages, current + 1))} className="border px-3 py-1 disabled:text-slate-400">Sledeća</button>
        </div>
      </div>
      {loading && <div className="border border-slate-200 bg-white p-6">Učitavanje porudžbina...</div>}
      {dateRangeError && <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">{dateRangeError}</div>}
      {exportWarning && <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">{exportWarning}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">{success}</div>}
      {!loading && orders.length === 0 && <div className="border border-slate-200 bg-white p-6">Nema porudžbina za izabrani filter.</div>}
      {!loading && orders.length > 0 && (
        <div className="overflow-x-auto bg-white">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">Broj</th><th>Kupac</th><th>Status</th><th>Stavke</th><th>Interna napomena</th><th>Ukupno</th><th>Detalji</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  expanded={expandedId === order.id}
                  note={notes[order.id] ?? ''}
                  saving={savingId === order.id}
                  onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  onNoteChange={(value) => setNotes((current) => ({ ...current, [order.id]: value }))}
                  onSaveNote={() => void saveNote(order)}
                  onStatusChange={(status) => void changeStatus(order, status)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
