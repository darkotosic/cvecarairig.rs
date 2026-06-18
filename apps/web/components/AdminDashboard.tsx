'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { AdminSummary } from '@/lib/api';
import { ApiError, getAdminSummary } from '@/lib/api';
import { Price } from './Price';
import { AdminAuditLogsPanel } from './admin/AdminAuditLogsPanel';
import { AdminCategoriesPanel } from './admin/AdminCategoriesPanel';
import { AdminOrdersPanel } from './admin/AdminOrdersPanel';
import { AdminProductsPanel } from './admin/AdminProductsPanel';
import { AdminSettingsPanel } from './admin/AdminSettingsPanel';
import { AdminShell, type AdminTab } from './admin/AdminShell';

function adminErrorMessage(error: unknown) {
  if (error instanceof ApiError) return `Admin API greška (${error.status}).`;
  return 'Admin podaci trenutno nisu dostupni.';
}

export function AdminDashboard() {
  const router = useRouter();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [periodDays, setPeriodDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminSummary(periodDays);
        if (mounted) setSummary(data);
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          router.replace('/admin/login');
          return;
        }
        if (mounted) setError(adminErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadSummary();
    return () => { mounted = false; };
  }, [periodDays, router]);

  return (
    <AdminShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-primary">Pregled prodavnice</h2>
            <label className="text-sm font-medium text-slate-700">
              Period
              <select value={periodDays} onChange={(event) => setPeriodDays(Number(event.target.value))} className="ml-2 border border-slate-300 px-3 py-2">
                <option value={7}>7 dana</option>
                <option value={30}>30 dana</option>
                <option value={90}>90 dana</option>
              </select>
            </label>
          </div>
          {loading && <div className="border border-slate-200 bg-white p-6">Učitavanje admin podataka...</div>}
          {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {!loading && !error && summary && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Nove porudžbine', summary.new_orders],
                  ['Potvrđene', summary.confirmed_orders],
                  ['Spakovane', summary.packed_orders],
                  ['Poslate', summary.shipped_orders],
                  ['Isporučene', summary.delivered_orders],
                  ['Otkazane', summary.cancelled_orders],
                  ['Aktivni proizvodi', summary.active_products],
                  ['Bez zaliha', summary.out_of_stock_products],
                  ['Proizvodi pri kraju zaliha', summary.low_stock_products.length],
                ].map(([label, value]) => (
                  <div key={label} className="border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
                  </div>
                ))}
                <div className="border border-slate-200 bg-white p-5 sm:col-span-2">
                  <p className="text-sm text-slate-500">Prihod iz isporučenih</p>
                  <p className="mt-2 text-3xl font-bold text-primary"><Price cents={summary.total_revenue_cents} currency="RSD" /></p>
                </div>
                <div className="border border-slate-200 bg-white p-5 sm:col-span-2">
                  <p className="text-sm text-slate-500">Prosečna porudžbina</p>
                  <p className="mt-2 text-3xl font-bold text-primary"><Price cents={summary.average_order_value_cents} currency="RSD" /></p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <div className="border border-slate-200 bg-white p-5">
                  <h3 className="font-bold text-primary">Prihod po danima</h3>
                  {summary.revenue_by_day.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">Nema isporučenih porudžbina u periodu.</p>
                  ) : (
                    <table className="mt-3 w-full text-left text-sm">
                      <thead><tr className="border-b bg-slate-50"><th className="p-2">Datum</th><th>Prihod</th></tr></thead>
                      <tbody>{summary.revenue_by_day.map((row) => (
                        <tr key={row.date} className="border-b"><td className="p-2">{row.date}</td><td><Price cents={row.revenue_cents} currency="RSD" /></td></tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
                <div className="border border-slate-200 bg-white p-5">
                  <h3 className="font-bold text-primary">Top proizvodi</h3>
                  {summary.top_products.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">Nema prodatih proizvoda u isporučenim porudžbinama.</p>
                  ) : (
                    <table className="mt-3 w-full text-left text-sm">
                      <thead><tr className="border-b bg-slate-50"><th className="p-2">Proizvod</th><th>Kom.</th><th>Prihod</th></tr></thead>
                      <tbody>{summary.top_products.map((product) => (
                        <tr key={product.product_name} className="border-b"><td className="p-2">{product.product_name}</td><td>{product.quantity_sold}</td><td><Price cents={product.revenue_cents} currency="RSD" /></td></tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
                <div className="border border-slate-200 bg-white p-5">
                  <h3 className="font-bold text-primary">Porudžbine po danima</h3>
                  {summary.orders_by_day.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">Nema porudžbina u periodu.</p>
                  ) : (
                    <table className="mt-3 w-full text-left text-sm">
                      <thead><tr className="border-b bg-slate-50"><th className="p-2">Datum</th><th>Broj</th></tr></thead>
                      <tbody>{summary.orders_by_day.map((row) => (
                        <tr key={row.date} className="border-b"><td className="p-2">{row.date}</td><td>{row.orders_count}</td></tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
              </div>
              <div className="border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-primary">Proizvodi pri kraju zaliha</h3>
                {summary.low_stock_products.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">Nema proizvoda pri kraju zaliha.</p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead><tr className="border-b bg-slate-50"><th className="p-2">Naziv</th><th>SKU</th><th>Base stock</th><th>Variant stock</th><th>Effective stock</th></tr></thead>
                      <tbody>{summary.low_stock_products.map((product) => (
                        <tr key={product.id} className="border-b">
                          <td className="p-2 font-medium">{product.name}</td>
                          <td>{product.sku ?? '-'}</td>
                          <td>{product.stock_quantity}</td>
                          <td>{product.variant_stock_quantity}</td>
                          <td>{product.effective_stock_quantity}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}
      {activeTab === 'orders' && <AdminOrdersPanel />}
      {activeTab === 'products' && <AdminProductsPanel />}
      {activeTab === 'categories' && <AdminCategoriesPanel />}
      {activeTab === 'settings' && <AdminSettingsPanel />}
      {activeTab === 'audit' && <AdminAuditLogsPanel />}
    </AdminShell>
  );
}
