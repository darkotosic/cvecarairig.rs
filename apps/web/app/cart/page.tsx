import type { Metadata } from 'next';
import { CartView } from '@/components/CartView';
import { SectionHeader } from '@/components/SectionHeader';

export const metadata: Metadata = { title: 'Korpa', description: 'Pregled proizvoda u korpi i ukupne cene porudžbine.' };

export default function CartPage() { return <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8"><SectionHeader title="Korpa" description="Pregled proizvoda, količina i ukupne cene pre checkout-a." /><CartView /></main>; }
