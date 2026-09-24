export function Price({ value }: { value: number }) {
  return <span>{new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(value)}</span>;
}
