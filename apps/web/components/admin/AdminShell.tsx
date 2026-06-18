'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { adminLogout } from '@/lib/api';

type AdminTab = 'overview' | 'orders' | 'products' | 'categories' | 'settings' | 'audit';

const tabs: { id: AdminTab; label: string }[] = [
  { id: 'overview', label: 'Pregled' },
  { id: 'orders', label: 'Porudžbine' },
  { id: 'products', label: 'Proizvodi' },
  { id: 'categories', label: 'Kategorije' },
  { id: 'settings', label: 'Podešavanja' },
  { id: 'audit', label: 'Audit log' },
];

export function AdminShell({
  activeTab,
  onTabChange,
  children,
}: {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: ReactNode;
}) {
  const router = useRouter();
  const [logoutPending, setLogoutPending] = useState(false);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    async function handleExpired() {
      setSessionMessage('Sesija je istekla. Prijavite se ponovo.');
      setLogoutPending(true);
      try {
        await adminLogout();
      } finally {
        router.replace('/admin/login');
      }
    }

    window.addEventListener('cvecarairig:admin-auth-expired', handleExpired);
    return () => window.removeEventListener('cvecarairig:admin-auth-expired', handleExpired);
  }, [router]);

  async function logout() {
    setLogoutPending(true);
    try {
      await adminLogout();
      router.replace('/admin/login');
    } finally {
      setLogoutPending(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {sessionMessage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {sessionMessage}
        </div>
      )}

      <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2" aria-label="Admin navigacija">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={logout}
          disabled={logoutPending}
          className="bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {logoutPending ? 'Odjava...' : 'Odjavi se'}
        </button>
      </nav>

      {children}
    </div>
  );
}

export type { AdminTab };
