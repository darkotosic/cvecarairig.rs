import { CallToOrderButton } from './CallToOrderButton';

export function StickyCallButton({ phone }: { phone?: string | null }) {
  return (
    <CallToOrderButton
      phone={phone}
      label="Pozovite"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary/30 sm:bottom-6 sm:right-6 sm:h-16 sm:px-6 sm:text-base"
    />
  );
}
