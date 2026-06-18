import type { Metadata } from 'next';
import { loadPublicStoreSettings } from '@/lib/store-settings';
export const metadata: Metadata = { title: 'Dostava', description: 'Dostava cveća u Irigu i okolini.', alternates: { canonical: '/shipping' } };
export default async function ShippingPage() {
  const settings = await loadPublicStoreSettings();
  const contact = [settings.store_phone, settings.whatsapp_url, settings.store_email].filter(Boolean).join(' • ');
  return <main className="mx-auto max-w-4xl px-4 py-12 text-slate-700"><h1 className="text-4xl font-bold text-primary">Dostava i poručivanje</h1><section className="mt-6 space-y-3 rounded-3xl bg-slate-50 p-6"><h2 className="text-2xl font-semibold text-slate-900">Lokalna dostava cveća</h2><p>Dostava se potvrđuje telefonom nakon slanja porudžbine.</p><p>Dostava istog dana zavisi od dostupnosti cveća, vremena poručivanja i adrese.</p><p>{settings.service_area ?? 'Područje dostave biće potvrđeno telefonom.'}</p><p>{settings.same_day_cutoff ?? 'Za hitne porudžbine kupac treba da kontaktira cvećaru telefonom ili WhatsApp-om.'}</p></section><section className="mt-6 space-y-3 rounded-3xl bg-white p-6 ring-1 ring-slate-200"><h2 className="text-2xl font-semibold text-slate-900">Plaćanje</h2><p>{settings.payment_methods ?? 'Plaćanje pouzećem, uplata na račun ili po dogovoru.'}</p>{contact ? <p>Za hitne porudžbine: {contact}</p> : <p>Kontakt podaci podrške trenutno nisu javno podešeni.</p>}</section></main>;
}
