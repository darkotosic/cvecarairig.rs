'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';
import type { CartLine } from '@/lib/api';
import { ApiError, createGuestOrder } from '@/lib/api';
import { clearCart, getCart } from '@/lib/cart';
import { Price } from './Price';

const phonePattern = /^[0-9+/\-\s]{6,80}$/;

const fields = [
  ['customer_name', 'Ime i prezime kupca', 'text'],
  ['customer_phone', 'Telefon kupca', 'tel'],
  ['customer_email', 'Email', 'email'],
  ['shipping_city', 'Grad', 'text'],
  ['shipping_postal_code', 'Poštanski broj', 'text'],
  ['shipping_address', 'Adresa', 'text'],
] as const;

function formatApiDetail(detail: unknown): string | null {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (!item || typeof item !== 'object') return String(item);
        const message = 'msg' in item ? String((item as { msg?: unknown }).msg ?? '') : '';
        const location = 'loc' in item && Array.isArray((item as { loc?: unknown }).loc)
          ? (item as { loc: unknown[] }).loc.join('.')
          : '';
        return [location, message].filter(Boolean).join(': ');
      })
      .filter(Boolean)
      .join('\n');
  }
  return null;
}

const extractError = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.details && typeof error.details === 'object' && 'detail' in error.details) {
      const message = formatApiDetail((error.details as { detail?: unknown }).detail);
      if (message) return message;
    }
    return `Porudžbina nije poslata zbog greške API-ja (${error.status}). Proverite podatke ili pokušajte ponovo za nekoliko minuta.`;
  }
  return 'Porudžbina nije poslata. Proverite obavezna polja, telefon i adresu, pa pokušajte ponovo.';
};

function validateCheckout(form: FormData, lines: CartLine[]) {
  const errors: string[] = [];
  const phone = String(form.get('customer_phone') ?? '').trim();
  const postalCode = String(form.get('shipping_postal_code') ?? '').trim();
  const digits = phone.replace(/\D/g, '');

  if (lines.length === 0) errors.push('Korpa je prazna. Dodajte proizvod pre checkout-a.');
  if (!phonePattern.test(phone)) errors.push('Telefon sme da sadrži samo cifre, +, razmak, / i - i mora imati najmanje 6 karaktera.');
  if (digits.length < 6) errors.push('Telefon mora imati najmanje 6 cifara.');
  if (!/^\d{5}$/.test(postalCode)) errors.push('Poštanski broj mora imati tačno 5 cifara.');
  const recipientPhone = String(form.get('recipient_phone') ?? '').trim();
  const cardMessage = String(form.get('card_message') ?? '');
  const deliveryDate = String(form.get('delivery_date') ?? '');
  if (recipientPhone && !phonePattern.test(recipientPhone)) errors.push('Telefon primaoca nije ispravan.');
  if (deliveryDate && deliveryDate < new Date().toISOString().slice(0, 10)) errors.push('Datum dostave ne sme biti u prošlosti.');
  if (cardMessage.length > 500) errors.push('Poruka za karticu može imati najviše 500 karaktera.');
  if (form.get('terms') !== 'on') errors.push('Morate prihvatiti uslove kupovine i politiku privatnosti pre slanja porudžbine.');

  return errors;
}

export function CheckoutForm() {
  const router = useRouter();
  const [lines] = useState<CartLine[]>(() => getCart());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const idempotencyKeyRef = useRef<string | null>(null);
  const total = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);

  if (!lines.length) {
    return (
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
        <p>Korpa je prazna.</p>
        <Link href="/products" className="mt-4 inline-block bg-primary px-5 py-3 text-sm font-semibold text-white">
          Pogledaj aranžmane
        </Link>
      </div>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = new FormData(event.currentTarget);
    const validationErrors = validateCheckout(form, lines);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    setError(null);
    setSubmitting(true);
    idempotencyKeyRef.current ||= typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `checkout-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    try {
      const order = await createGuestOrder({
        customer_name: String(form.get('customer_name') ?? '').trim(),
        customer_email: String(form.get('customer_email') ?? '').trim() || undefined,
        customer_phone: String(form.get('customer_phone') ?? '').trim(),
        shipping_city: String(form.get('shipping_city') ?? '').trim(),
        shipping_postal_code: String(form.get('shipping_postal_code') ?? '').trim(),
        shipping_address: String(form.get('shipping_address') ?? '').trim(),
        note: String(form.get('note') ?? '').trim() || undefined,
        recipient_name: String(form.get('recipient_name') ?? '').trim() || undefined,
        recipient_phone: String(form.get('recipient_phone') ?? '').trim() || undefined,
        delivery_date: String(form.get('delivery_date') ?? '').trim() || undefined,
        delivery_time_window: String(form.get('delivery_time_window') ?? '').trim() || undefined,
        card_message: String(form.get('card_message') ?? '').trim() || undefined,
        occasion: String(form.get('occasion') ?? '').trim() || undefined,
        accepted_terms: true,
        source: 'web',
        idempotency_key: idempotencyKeyRef.current,
        items: lines.map((line) => ({
          product_id: line.productId,
          variant_id: line.variantId,
          quantity: line.quantity,
        })),
      });
      clearCart();
      router.push(`/checkout/success?order=${encodeURIComponent(order.order_number)}`);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([name, label, type]) => (
            <label key={name} className="text-sm font-medium text-slate-700">
              {label}
              <input
                name={name}
                required={name !== 'customer_email'}
                type={type}
                disabled={isSubmitting}
                className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-primary disabled:bg-slate-100"
              />
            </label>
          ))}

          <label className="text-sm font-medium text-slate-700">
            Ime primaoca (opciono)
            <input name="recipient_name" disabled={isSubmitting} className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-primary disabled:bg-slate-100" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Telefon primaoca (opciono)
            <input name="recipient_phone" type="tel" disabled={isSubmitting} className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-primary disabled:bg-slate-100" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Datum dostave (opciono)
            <input name="delivery_date" type="date" disabled={isSubmitting} className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-primary disabled:bg-slate-100" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Vremenski okvir dostave (opciono)
            <select name="delivery_time_window" disabled={isSubmitting} className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-primary disabled:bg-slate-100">
              <option value="">Bilo kada tokom dana</option><option>Pre podne</option><option>Popodne</option><option>Uveče</option><option>Po dogovoru telefonom</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Prilika (opciono)
            <input name="occasion" placeholder="Rođendan, godišnjica, slava..." disabled={isSubmitting} className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-primary disabled:bg-slate-100" />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Poruka za karticu (opciono)
            <textarea name="card_message" maxLength={500} disabled={isSubmitting} className="mt-2 min-h-24 w-full border border-slate-300 px-3 py-3 outline-none focus:border-primary disabled:bg-slate-100" placeholder="Npr. Srećan rođendan, voli te..." />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Napomena za porudžbinu
            <textarea
              name="note"
              disabled={isSubmitting}
              className="mt-2 min-h-28 w-full border border-slate-300 px-3 py-3 outline-none focus:border-primary disabled:bg-slate-100"
              placeholder="Npr. najbolje vreme za poziv ili dodatna napomena za dostavu"
            />
          </label>
          <label className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 sm:col-span-2">
            <input name="terms" type="checkbox" required disabled={isSubmitting} className="mt-1" />
            <span>
              Prihvatam{' '}
              <Link href="/terms-and-conditions" className="font-semibold text-primary underline">
                uslove kupovine
              </Link>{' '}
              i{' '}
              <Link href="/privacy-policy" className="font-semibold text-primary underline">
                politiku privatnosti
              </Link>
              .
            </span>
          </label>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2" role="alert">
              {error.split('\n').map((line) => <p key={line}>{line}</p>)}
            </div>
          )}
          <button
            disabled={isSubmitting}
            className="bg-primary px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400 sm:col-span-2"
          >
            {isSubmitting ? 'Slanje porudžbine...' : 'Pošalji porudžbinu'}
          </button>
        </div>
      </section>
      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-primary">Vaša porudžbina</h2>
        <div className="mt-4 space-y-4">
          {lines.map((line) => {
            const imageFailed = line.imageUrl ? failedImages.includes(line.imageUrl) : false;
            return (
              <div key={line.lineId} className="grid grid-cols-[64px_1fr] gap-3">
                <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
                  {line.imageUrl && !imageFailed ? (
                    <img
                      src={line.imageUrl}
                      alt={`${line.name} u porudžbini`}
                      onError={() => setFailedImages((urls) => line.imageUrl ? [...urls, line.imageUrl] : urls)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-1 text-center text-[10px] text-slate-500">
                      Slika uskoro
                    </div>
                  )}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-primary">{line.name}</p>
                  {line.variantLabel && <p className="text-xs text-slate-500">{line.variantLabel}</p>}
                  <p className="text-slate-500">Količina: {line.quantity}</p>
                  <Price cents={line.unitPriceCents * line.quantity} currency={line.currency} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="flex justify-between font-bold text-primary">
            <span>Ukupno</span>
            <Price cents={total} currency={lines[0]?.currency ?? 'RSD'} />
          </p>
          <p className="mt-2 text-xs text-slate-500">Plaćanje pouzećem. Dostava se potvrđuje telefonom.</p>
        </div>
      </aside>
    </form>
  );
}
