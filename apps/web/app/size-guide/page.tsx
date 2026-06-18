import type { Metadata } from 'next';
import { loadPublicStoreSettings } from '@/lib/store-settings';

export const metadata: Metadata = { title: 'Vodič za veličine', description: 'Saveti za izbor veličine garderobe pre poručivanja.', alternates: { canonical: '/size-guide' } };

export default async function SizeGuidePage() {
  const settings = await loadPublicStoreSettings();
  const contact = [settings.store_email, settings.store_phone].filter(Boolean).join(' • ');

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-slate-700">
      <h1 className="text-4xl font-bold text-primary">Vodič za veličine</h1>
      <p className="mt-4">Uporedite mere proizvoda sa garderobom koju već nosite. Ako opis proizvoda nema dovoljno podataka, proverite veličinu pre poručivanja.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {['S', 'M', 'L/XL'].map((size) => <div key={size} className="rounded-3xl border border-slate-200 p-5 text-center font-bold text-primary">{size}</div>)}
      </div>
      <section className="mt-6 rounded-3xl bg-slate-50 p-6">
        <h2 className="text-2xl font-semibold text-slate-900">Niste sigurni?</h2>
        {contact ? <p className="mt-3">Kontaktirajte nas pre poručivanja: {contact}</p> : <p className="mt-3">Kontakt podaci za proveru veličine trenutno nisu javno podešeni.</p>}
      </section>
    </main>
  );
}
