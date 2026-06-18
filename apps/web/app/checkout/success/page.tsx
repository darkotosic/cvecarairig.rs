import Link from 'next/link';

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8"><h1 className="text-3xl font-bold text-primary">Porudžbina je primljena</h1>{order && <p className="mt-4 text-lg">Broj porudžbine: <strong>{order}</strong></p>}<p className="mt-4 text-slate-700">Kupac će biti kontaktiran radi potvrde porudžbine i dogovora oko dostave.</p><Link href="/products" className="mt-8 inline-block bg-primary px-5 py-3 text-sm font-semibold text-white">Nazad na proizvode</Link></main>;
}
