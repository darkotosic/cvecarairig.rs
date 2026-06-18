import type { Metadata } from 'next';
import { loadPublicStoreSettings } from '@/lib/store-settings';

export const metadata: Metadata = { title: 'Politika privatnosti', description: 'Informacije o obradi podataka kupaca i kontaktima za privatnost.', alternates: { canonical: '/privacy-policy' } };

export default async function PrivacyPolicyPage() {
  const settings = await loadPublicStoreSettings();
  const contact = [settings.store_email, settings.store_phone].filter(Boolean).join(' • ');
  const hasControllerDetails = Boolean(settings.company_name || settings.company_address || settings.company_registration_number || settings.company_tax_id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-slate-700">
      <h1 className="text-4xl font-bold text-primary">Politika privatnosti</h1>
      <p className="mt-4">Ova stranica objašnjava koje podatke kupaca online prodavnica obrađuje u vezi sa porudžbinama, komunikacijom, dostavom i bezbednošću sajta.</p>
      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Rukovalac podacima</h2>
        {hasControllerDetails ? (
          <>
            {settings.company_name && <p>{settings.company_name}</p>}
            {settings.company_address && <p>{settings.company_address}</p>}
            {settings.company_registration_number && <p>Matični broj: {settings.company_registration_number}</p>}
            {settings.company_tax_id && <p>PIB: {settings.company_tax_id}</p>}
          </>
        ) : (
          <p>Podaci o rukovaocu trenutno nisu javno podešeni u podešavanjima prodavnice.</p>
        )}
      </section>
      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Koje podatke obrađujemo</h2>
        <p>Podaci za porudžbinu mogu uključivati ime i prezime, telefon, email ako je unet, adresu za dostavu, grad, poštanski broj, sadržaj porudžbine i napomenu kupca.</p>
        <p>Sistem može čuvati IP adresu, user-agent, vreme prihvatanja uslova i tehničke identifikatore porudžbine radi bezbednosti, dokazivanja poručivanja i sprečavanja dupliranja porudžbina.</p>
      </section>
      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Svrhe obrade</h2>
        <p>Podaci se koriste za obradu porudžbine, proveru dostupnosti, organizaciju dostave, komunikaciju sa kupcem, rešavanje reklamacija i ispunjenje zakonskih obaveza.</p>
      </section>
      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Kontakt za privatnost</h2>
        {contact ? <p>{contact}</p> : <p>Kontakt podaci za privatnost trenutno nisu javno podešeni.</p>}
      </section>
    </main>
  );
}
