export function Price({ value }: { value: number | null }) {
  if (value === null) return <span>Cena na upit</span>;
  return <span>{new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(value)}</span>;
}
