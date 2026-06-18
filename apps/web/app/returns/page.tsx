import type { Metadata } from 'next';
import { loadPublicStoreSettings } from '@/lib/store-settings';
export const metadata: Metadata = { title: 'Reklamacije', description: 'Reklamacije za sveže cvetne aranžmane.', alternates: { canonical: '/returns' } };
export default async function ReturnsPage() {
  const settings = await loadPublicStoreSettings();
  const contact = [settings.store_email, settings.store_phone].filter(Boolean).join(' • ');
  return <main className="mx-auto max-w-4xl px-4 py-12 text-slate-700"><h1 className="text-4xl font-bold text-primary">Reklamacije</h1><section className="mt-6 space-y-3 rounded-3xl bg-slate-50 p-6"><h2 className="text-2xl font-semibold text-slate-900">Sveže i personalizovane porudžbine</h2><p>Pošto su cveće i sveži aranžmani kvarljiva/personalizovana roba, klasičan povraćaj nije uvek moguć.</p><p>Reklamacije se rešavaju individualno, uz fotografiju aranžmana i broj porudžbine.</p><p>Ako je došlo do greške u isporuci ili oštećenja, kupac treba da nas kontaktira odmah po prijemu.</p></section><section className="mt-6 space-y-3 rounded-3xl bg-white p-6 ring-1 ring-slate-200"><h2 className="text-2xl font-semibold text-slate-900">Kako pokrenuti reklamaciju</h2><p>Pripremite broj porudžbine, ime na porudžbini, kontakt telefon, fotografiju aranžmana i kratak opis zahteva.</p>{contact ? <p>Kontakt: {contact}</p> : <p>Kontakt podaci podrške trenutno nisu javno podešeni.</p>}</section></main>;
}
