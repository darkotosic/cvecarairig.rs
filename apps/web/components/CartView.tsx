'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CartLine } from '@/lib/api';
import { clearCart, getCart, removeCartLine, updateCartLine } from '@/lib/cart';
import { Price } from './Price';

function EmptyCart() {
  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
      <p className="text-slate-600">Korpa je trenutno prazna.</p>
      <Link className="mt-6 inline-block bg-primary px-5 py-3 text-sm font-semibold text-white" href="/products">Nastavi kupovinu</Link>
    </div>
  );
}

function CartLineRow({ line, imageFailed, onImageFailed, onRefresh }: { line: CartLine; imageFailed: boolean; onImageFailed: () => void; onRefresh: () => void }) {
  return (
    <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 sm:grid-cols-[96px_1fr_auto]">
      <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
        {line.imageUrl && !imageFailed ? (
          <img src={line.imageUrl} alt={`${line.name} u korpi`} onError={onImageFailed} className="h-full w-full object-cover" />
        ) : <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-2 text-center text-xs text-slate-500">Slika uskoro</div>}
      </div>
      <div>
        <Link href={`/products/${line.slug}`} className="font-semibold text-primary">{line.name}</Link>
        {line.variantLabel && <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-700">Varijanta: {line.variantLabel}</p>}
        <p className="mt-2 font-semibold"><Price cents={line.unitPriceCents} currency={line.currency} /></p>
        {line.quantity === line.stockQuantity && <p className="mt-2 rounded-lg bg-blue-50 p-2 text-sm text-blue-700">Dostignut je maksimum dostupne zalihe za izabranu varijantu/artikal.</p>}
        {line.quantity > line.stockQuantity && <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-700">Količina je veća od dostupne zalihe za izabranu varijantu/artikal ({line.stockQuantity}).</p>}
      </div>
      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        <label className="text-xs font-medium text-slate-500">
          Količina
          <input type="number" min={1} max={line.stockQuantity} value={line.quantity} onChange={(event) => { updateCartLine(line.lineId, Number(event.target.value)); onRefresh(); }} className="mt-1 w-20 border border-slate-300 px-3 py-2 text-slate-900" />
        </label>
        <button type="button" onClick={() => { removeCartLine(line.lineId); onRefresh(); }} className="text-sm font-semibold text-red-700">Ukloni</button>
      </div>
    </div>
  );
}

export function CartView() {
  const [lines, setLines] = useState<CartLine[]>(() => getCart());
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const refresh = () => setLines(getCart());

  useEffect(() => {
    window.addEventListener('simeonshop:cart', refresh);
    return () => window.removeEventListener('simeonshop:cart', refresh);
  }, []);

  const total = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  if (!lines.length) return <EmptyCart />;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {lines.map((line) => (
          <CartLineRow
            key={line.lineId}
            line={line}
            imageFailed={line.imageUrl ? failedImages.includes(line.imageUrl) : false}
            onImageFailed={() => setFailedImages((urls) => line.imageUrl ? [...urls, line.imageUrl] : urls)}
            onRefresh={refresh}
          />
        ))}
      </div>
      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-primary">Pregled kupovine</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p className="flex justify-between"><span>Stavke u korpi</span><span>{itemCount}</span></p>
          <p className="flex justify-between"><span>Međuzbir</span><Price cents={total} currency={lines[0]?.currency ?? 'RSD'} /></p>
          <p className="flex justify-between"><span>Dostava</span><span>Potvrđuje se pre slanja</span></p>
          <div className="border-t border-slate-200 pt-3">
            <p className="flex justify-between text-lg font-bold text-primary"><span>Ukupno</span><Price cents={total} currency={lines[0]?.currency ?? 'RSD'} /></p>
            <p className="mt-1 text-xs text-slate-500">Plaćanje pouzećem. Konačna dostava se potvrđuje uz porudžbinu.</p>
          </div>
        </div>
        <Link href="/checkout" className="mt-6 block bg-primary px-5 py-3 text-center text-sm font-semibold text-white">Nastavi na checkout</Link>
        <Link href="/products" className="mt-3 block text-center text-sm font-semibold text-secondary">Nazad ka katalogu</Link>
        <button type="button" onClick={() => { if (window.confirm('Da li ste sigurni da želite da ispraznite korpu?')) { clearCart(); refresh(); } }} className="mt-3 w-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">Isprazni korpu</button>
      </aside>
    </div>
  );
}
