import { GLOBAL_CTA_PHONE, normalizeTelHref } from '@/lib/contact';

type CallToOrderButtonProps = {
  phone?: string | null;
  label?: string;
  className?: string;
  productName?: string;
};

const baseClassName =
  'block w-full bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20';

export function CallToOrderButton({
  label = 'Pozovite',
  className,
  productName,
}: CallToOrderButtonProps) {
  const classes = className ?? baseClassName;

  const ctaPhone = GLOBAL_CTA_PHONE;

  return (
    <a
      href={`tel:${normalizeTelHref(ctaPhone)}`}
      aria-label={productName ? `Pozovite za ${productName}` : 'Pozovite cvećaru'}
      className={classes}
    >
      {label}
    </a>
  );
}
