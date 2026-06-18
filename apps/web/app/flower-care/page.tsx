import type { Metadata } from 'next';
import { getPublicStoreSettings } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Nega cveća',
  description: 'Saveti za čuvanje buketa, ruža i cvetnih aranžmana nakon isporuke.',
  alternates: { canonical: '/flower-care' },
};

export default async function FlowerCarePage() {
  const settings = await getPublicStoreSettings().catch(() => null);
  const contact = settings?.store_phone ?? settings?.store_email;
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">Saveti</p>
      <h1 className="text-4xl font-bold text-primary">Nega cveća</h1>
      <p className="mt-4 text-slate-700">Saveti za čuvanje buketa, ruža i cvetnih aranžmana nakon isporuke.</p>
      <div className="mt-8 grid gap-4">
        {[
          ['Kako produžiti svežinu buketa', 'Skratite stabljike ukoso, uklonite listove koji dodiruju vodu i koristite čistu vazu.'],
          ['Kada promeniti vodu', 'Vodu menjajte svakog ili svakog drugog dana, a vazu isperite pre vraćanja cveća.'],
          ['Gde držati aranžman', 'Držite aranžman na hladnijem mestu, dalje od direktnog sunca, izvora toplote i zrelog voća.'],
          ['Šta izbegavati', 'Izbegavajte direktno sunce, grejanje, promaju i pretopla mesta jer ubrzavaju venuće.'],
          ['Kontakt za preporuku', contact ? `Za konkretnu preporuku oko održavanja aranžmana kontaktirajte nas: ${contact}.` : 'Kontakt podaci za preporuku biće prikazani nakon podešavanja u admin panelu.'],
        ].map(([title, text]) => (
          <section key={title} className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-primary">{title}</h2>
            <p className="mt-2 text-slate-600">{text}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
