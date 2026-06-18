'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ApiError, adminRegister } from '@/lib/api';

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const details = error.details;
    if (typeof details === 'object' && details !== null && 'detail' in details) {
      const detail = (details as { detail?: unknown }).detail;
      if (typeof detail === 'string') return detail;
    }
  }

  return 'Admin registracija nije uspela.';
}

export function AdminRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      await adminRegister(
        String(form.get('full_name')),
        String(form.get('email')),
        String(form.get('password')),
        String(form.get('bootstrap_token')),
      );
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4 border border-slate-200 bg-white p-6">
      <label className="block text-sm font-medium">
        Ime i prezime
        <input name="full_name" required minLength={2} className="mt-2 w-full border border-slate-300 px-3 py-3" />
      </label>

      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" required className="mt-2 w-full border border-slate-300 px-3 py-3" />
      </label>

      <label className="block text-sm font-medium">
        Lozinka
        <input name="password" type="password" required minLength={8} className="mt-2 w-full border border-slate-300 px-3 py-3" />
      </label>

      <label className="block text-sm font-medium">
        Bootstrap token
        <input name="bootstrap_token" type="password" required className="mt-2 w-full border border-slate-300 px-3 py-3" />
      </label>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button disabled={loading} className="w-full bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? 'Kreiranje admina...' : 'Kreiraj admin nalog'}
      </button>
    </form>
  );
}
