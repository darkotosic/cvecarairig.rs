import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/CheckoutForm';
import { SectionHeader } from '@/components/SectionHeader';

export const metadata: Metadata = { title: 'Checkout', description: 'Checkout forma za porudžbine pouzećem.' };

export default function CheckoutPage() { return <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8"><SectionHeader title="Checkout" description="Plaćanje pouzećem. Kontaktiraćemo vas radi potvrde porudžbine." /><CheckoutForm /></main>; }
