import { AdminLoginForm } from '@/components/AdminLoginForm';
import { SectionHeader } from '@/components/SectionHeader';

export default function AdminLoginPage() { return <main className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8"><SectionHeader title="Admin prijava" description="Zaštićen pristup administraciji prodavnice." /><AdminLoginForm /></main>; }
