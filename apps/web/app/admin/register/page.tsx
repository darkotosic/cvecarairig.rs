import { AdminRegisterForm } from '@/components/AdminRegisterForm';
import { SectionHeader } from '@/components/SectionHeader';

export default function AdminRegisterPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        title="Admin registracija"
        description="Kreiranje prvog admin naloga. Posle registracije automatski se otvara dashboard."
      />
      <AdminRegisterForm />
    </main>
  );
}
