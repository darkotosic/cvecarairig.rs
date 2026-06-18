import type { Metadata } from 'next';
import { SectionHeader } from '@/components/SectionHeader';
import { loadPublicStoreSettings } from '@/lib/store-settings';

export const metadata: Metadata = {
  title: 'O nama',
  alternates: { canonical: '/about' },
  description: 'Informacije o Cvećari Irig, kontaktima i načinu poručivanja cveća.',
};

export default async function AboutPage() {
  const settings = await loadPublicStoreSettings();
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        title="O nama"
        description="Cvećara Irig je lokalna cvećara fokusirana na sveže bukete, ruže, flower box aranžmane, poklone i aranžmane za posebne prilike."
      />
      <section className="mt-8 rounded-3xl bg-slate-50 p-6 text-slate-700">
        <h2 className="text-2xl font-semibold text-slate-900">Podaci o prodavcu</h2>
        <div className="mt-4 space-y-2">
          {settings.company_name ? <p><strong>Naziv:</strong> {settings.company_name}</p> : <p>Naziv prodavca trenutno nije javno podešen.</p>}
          {settings.company_address ? <p><strong>Adresa:</strong> {settings.company_address}</p> : <p>Adresa prodavca trenutno nije javno podešena.</p>}
          {settings.company_registration_number && <p><strong>Matični broj:</strong> {settings.company_registration_number}</p>}
          {settings.company_tax_id && <p><strong>PIB:</strong> {settings.company_tax_id}</p>}
        </div>
      </section>
    </main>
  );
}
