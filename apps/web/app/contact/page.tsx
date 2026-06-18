import type { Metadata } from 'next';
import { SectionHeader } from '@/components/SectionHeader';
import { loadPublicStoreSettings } from '@/lib/store-settings';

export const metadata: Metadata = {
  title: 'Kontakt',
  alternates: { canonical: '/contact' },
  description: 'Kontakt podaci za pitanja o aranžmanima, porudžbinama, dostavi, reklamacijama i reklamacijama.',
};

export default async function ContactPage() {
  const settings = await loadPublicStoreSettings();
  const hasDirectContact = Boolean(settings.store_email || settings.store_phone || settings.instagram_url || settings.facebook_url);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader title="Kontakt" description="Za pitanja o aranžmanima, porudžbinama, dostavi, reklamacijama i reklamacijama koristite javno podešene kontakte prodavnice." />
      <div className="mt-8 space-y-3 rounded-3xl border border-slate-200 bg-white p-6 text-slate-700">
        {settings.store_email && <p><strong>Email:</strong> {settings.store_email}</p>}
        {settings.store_phone && <p><strong>Telefon:</strong> {settings.store_phone}</p>}
        {settings.instagram_url && <p><strong>Instagram:</strong> <a className="text-secondary underline" href={settings.instagram_url} target="_blank" rel="noreferrer">{settings.instagram_url}</a></p>}
        {settings.facebook_url && <p><strong>Facebook:</strong> <a className="text-secondary underline" href={settings.facebook_url} target="_blank" rel="noreferrer">{settings.facebook_url}</a></p>}
        {!hasDirectContact && <p>Kontakt podaci trenutno nisu javno podešeni. Molimo pokušajte kasnije ili proverite potvrdu porudžbine ako ste je već kreirali.</p>}
      </div>
      <section className="mt-8 rounded-3xl bg-slate-50 p-6 text-slate-700">
        <h2 className="text-2xl font-semibold text-slate-900">Podaci o prodavcu</h2>
        <div className="mt-4 space-y-2">
          {settings.company_name ? <p><strong>Naziv:</strong> {settings.company_name}</p> : <p>Naziv prodavca trenutno nije javno podešen.</p>}
          {settings.company_address && <p><strong>Adresa:</strong> {settings.company_address}</p>}
          {settings.company_registration_number && <p><strong>Matični broj:</strong> {settings.company_registration_number}</p>}
          {settings.company_tax_id && <p><strong>PIB:</strong> {settings.company_tax_id}</p>}
        </div>
      </section>
    </main>
  );
}
