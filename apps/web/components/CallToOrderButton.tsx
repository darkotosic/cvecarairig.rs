import { normalizeTelHref, store } from '@/lib/store';
export function CallToOrderButton({ label = 'Pozovite', className, productName }: { phone?: string | null; label?: string; className?: string; productName?: string }) {
  return <a href={`tel:${normalizeTelHref(store.phone)}`} aria-label={productName ? `Pozovite za ${productName}` : 'Pozovite cvećaru'} className={className ?? 'block w-full bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20'}>{label}</a>;
}
