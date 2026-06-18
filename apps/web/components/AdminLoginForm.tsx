'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { adminLogin } from '@/lib/api';

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null);
    const form = new FormData(event.currentTarget);
    try { await adminLogin(String(form.get('email')), String(form.get('password'))); router.push('/admin/dashboard'); }
    catch { setError('Neispravni admin podaci za prijavu.'); }
  }
  return <form onSubmit={submit} className="mt-8 space-y-4 border border-slate-200 bg-white p-6"><label className="block text-sm font-medium">Email<input name="email" type="email" required className="mt-2 w-full border border-slate-300 px-3 py-3" /></label><label className="block text-sm font-medium">Lozinka<input name="password" type="password" required className="mt-2 w-full border border-slate-300 px-3 py-3" /></label>{error && <p className="text-sm text-red-700">{error}</p>}<button className="w-full bg-primary px-5 py-3 text-sm font-semibold text-white">Prijavi se</button></form>;
}
