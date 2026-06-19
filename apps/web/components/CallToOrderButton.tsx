import Link from 'next/link';

type CallToOrderButtonProps = {
  phone?: string | null;
  label?: string;
  className?: string;
  productName?: string;
};

const baseClassName = 'block w-full bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20';

function normalizeTelHref(phone: string) {
  const trimmed = phone.trim();
  const prefix = trimmed.startsWith('+') ? '+' : '';
  return `${prefix}${trimmed.replace(/[^\d]/g, '')}`;
}

export function CallToOrderButton({ phone, label = 'Pozovite', className, productName }: CallToOrderButtonProps) {
  const classes = className ?? baseClassName;

  if (!phone) {
    return <Link href="/contact" className={classes}>Pozovite / kontakt</Link>;
  }

  return (
    <a href={`tel:${normalizeTelHref(phone)}`} aria-label={productName ? `Pozovite za ${productName}` : 'Pozovite cvećaru'} className={classes}>
      {label}
    </a>
  );
}
