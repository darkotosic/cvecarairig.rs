import type { Metadata } from 'next';
import { loadPublicStoreSettings } from '@/lib/store-settings';

export const metadata: Metadata = { title: 'Povraćaj i reklamacije', description: 'Informacije o povraćaju, zamenama i reklamacijama.', alternates: { canonical: '/returns' } };

export default async function ReturnsPage() {
  const settings = await loadPublicStoreSettings();
  const contact = [settings.store_email, settings.store_phone].filter(Boolean).join(' • ');

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-slate-700">
      <h1 className="text-4xl font-bold text-primary">Povraćaj, zamene i reklamacije</h1>
      <section className="mt-6 space-y-3 rounded-3xl bg-slate-50 p-6">
        <h2 className="text-2xl font-semibold text-slate-900">Politika prodavnice</h2>
        <p>{settings.return_policy_short ?? 'Pravila povraćaja, zamena i reklamacija trenutno nisu javno podešena. Kupac treba da kontaktira prodavca sa brojem porudžbine pre slanja proizvoda nazad.'}</p>
      </section>
      <section className="mt-6 space-y-3 rounded-3xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">Kako pokrenuti zahtev</h2>
        <p>Pripremite broj porudžbine, ime na porudžbini, kontakt telefon i kratak opis zahteva.</p>
        <p>Proizvod nemojte slati nazad pre dogovora sa prodavcem o adresi, načinu slanja i daljim koracima.</p>
        {contact ? <p>Kontakt: {contact}</p> : <p>Kontakt podaci podrške trenutno nisu javno podešeni.</p>}
      </section>
    </main>
  );
}
