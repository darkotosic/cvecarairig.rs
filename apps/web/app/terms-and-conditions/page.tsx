import type { Metadata } from 'next';
import { loadPublicStoreSettings } from '@/lib/store-settings';

export const metadata: Metadata = { title: 'Uslovi kupovine', description: 'Uslovi kupovine, plaćanja, dostave i prihvatanja porudžbine.', alternates: { canonical: '/terms-and-conditions' } };

export default async function TermsPage() {
  const settings = await loadPublicStoreSettings();
  const hasSellerDetails = Boolean(
    settings.company_name || settings.company_address || settings.company_registration_number || settings.company_tax_id,
  );
  const contact = [settings.store_email, settings.store_phone].filter(Boolean).join(' ili ');

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-slate-700">
      <h1 className="text-4xl font-bold text-primary">Uslovi kupovine</h1>
      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Prodavac</h2>
        {hasSellerDetails ? (
          <>
            {settings.company_name && <p>{settings.company_name}</p>}
            {settings.company_address && <p>{settings.company_address}</p>}
            {settings.company_registration_number && <p>Matični broj: {settings.company_registration_number}</p>}
            {settings.company_tax_id && <p>PIB: {settings.company_tax_id}</p>}
          </>
        ) : (
          <p>Podaci o prodavcu trenutno nisu javno podešeni u podešavanjima prodavnice.</p>
        )}
      </section>
      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Poručivanje</h2>
        <p>Porudžbina se kreira kroz checkout unosom kontakt podataka, adrese za dostavu, izabranih artikala, količina i prihvatanjem ovih uslova.</p>
        <p>Nakon slanja porudžbine sistem čuva podatke o artiklima i kupcu kako porudžbina ne bi bila izgubljena ako opciona email potvrda nije dostupna.</p><p>Porudžbina je prihvaćena tek nakon potvrde cvećare. Fotografije su informativne; izgled aranžmana može blago varirati zbog sezonske dostupnosti cveća. Cvećara može predložiti zamenu cveta iste vrednosti ako konkretan cvet nije dostupan.</p>
      </section>
      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Cene i plaćanje</h2>
        <p>Cene proizvoda su prikazane na stranici proizvoda. Cena i dostava se potvrđuju pre finalne realizacije ako postoji specifičan zahtev kupca. Plaćanje je moguće pouzećem, uplatom na račun ili po dogovoru.</p>
      </section>
      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Dostava</h2>
        <p>{settings.delivery_note ?? 'Detalji dostave trenutno nisu javno podešeni. Prodavac treba da potvrdi način, rok i trošak dostave pre slanja pošiljke.'}</p>
      </section>
      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Reklamacije</h2>
        <p>{settings.return_policy_short ?? 'Pravila povraćaja, zamena i reklamacija trenutno nisu javno podešena. Kupac treba da kontaktira prodavca sa brojem porudžbine pre slanja proizvoda nazad.'}</p>
      </section>
      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Kontakt</h2>
        {contact ? <p>Za pitanja o kupovini koristite {contact}.</p> : <p>Kontakt podaci podrške trenutno nisu javno podešeni.</p>}
      </section>
    </main>
  );
}
