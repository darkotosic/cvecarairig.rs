export function Price({ cents, currency = 'RSD' }: { cents: number; currency?: string }) {
  return <span>{new Intl.NumberFormat('sr-RS', { style: 'currency', currency }).format(cents / 100)}</span>;
}
