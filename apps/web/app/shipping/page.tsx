import type { Metadata } from 'next';
import { loadPublicStoreSettings } from '@/lib/store-settings';

export const metadata: Metadata = { title: 'Dostava', description: 'Informacije o dostavi, potvrdi porudžbine i plaćanju.', alternates: { canonical: '/shipping' } };

export default async function ShippingPage() {
  const settings = await loadPublicStoreSettings();
  const contact = [settings.store_email, settings.store_phone].filter(Boolean).join(' • ');

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-slate-700">
      <h1 className="text-4xl font-bold text-primary">Dostava i plaćanje</h1>
      <section className="mt-6 space-y-3 rounded-3xl bg-slate-50 p-6">
        <h2 className="text-2xl font-semibold text-slate-900">Informacije o dostavi</h2>
        <p>{settings.delivery_note ?? 'Detalji dostave trenutno nisu javno podešeni. Nakon kreiranja porudžbine prodavac će koristiti unete podatke za potvrdu i organizaciju isporuke.'}</p>
        <p>Trošak, rok i način slanja treba da budu potvrđeni kupcu pre slanja pošiljke.</p>
      </section>
      <section className="mt-6 space-y-3 rounded-3xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">Plaćanje</h2>
        <p>Plaćanje je trenutno navedeno kao plaćanje pouzećem, prilikom preuzimanja pošiljke.</p>
        <p>Checkout čuva podatke o porudžbini i ne sme zavisiti od opcione email potvrde.</p>
        {contact ? <p>Za dodatna pitanja: {contact}</p> : <p>Kontakt podaci podrške trenutno nisu javno podešeni.</p>}
      </section>
    </main>
  );
}
