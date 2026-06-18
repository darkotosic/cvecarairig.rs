import { AdminDashboard } from '@/components/AdminDashboard';
import { SectionHeader } from '@/components/SectionHeader';

export default function AdminDashboardPage() { return <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><SectionHeader title="Admin dashboard" description="Realni podaci iz API-ja. Bez tokena nema prikaza administracije." /><AdminDashboard /></main>; }
