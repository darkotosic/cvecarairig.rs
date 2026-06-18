'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { FormEvent, useCallback, useEffect, useState } from 'react';
import type { StoreSetting } from '@/lib/api';
import { ApiError, getAdminSettings, updateAdminSetting } from '@/lib/api';

type SettingSection = 'Kontakt' | 'Social' | 'Dostava' | 'Povraćaj' | 'Firma' | 'Brend';

type PublicSettingConfig = {
  section: SettingSection;
  key: string;
  label: string;
  description: string;
  field: 'input' | 'textarea';
  inputType?: 'email' | 'tel' | 'url' | 'text';
  defaultPublic: boolean;
};

const publicSettings: PublicSettingConfig[] = [
  {
    section: 'Kontakt',
    key: 'store_phone',
    label: 'Telefon prodavnice',
    description: 'Prikazuje se u footeru, na kontakt strani i pravnim stranama kada je unet.',
    field: 'input',
    inputType: 'tel',
    defaultPublic: true,
  },
  {
    section: 'Kontakt',
    key: 'store_email',
    label: 'Email prodavnice',
    description: 'Prikazuje se u footeru, na kontakt strani i kao kontakt za kupce.',
    field: 'input',
    inputType: 'email',
    defaultPublic: true,
  },
  {
    section: 'Social',
    key: 'instagram_url',
    label: 'Instagram URL',
    description: 'Prikazuje se u footeru kao link ka Instagram profilu.',
    field: 'input',
    inputType: 'url',
    defaultPublic: true,
  },
  {
    section: 'Social',
    key: 'facebook_url',
    label: 'Facebook URL',
    description: 'Prikazuje se u footeru kao link ka Facebook stranici.',
    field: 'input',
    inputType: 'url',
    defaultPublic: true,
  },
  {
    section: 'Dostava',
    key: 'delivery_note',
    label: 'Napomena o dostavi',
    description: 'Prikazuje se na strani za dostavu i u uslovima kupovine.',
    field: 'textarea',
    defaultPublic: true,
  },
  {
    section: 'Povraćaj',
    key: 'return_policy_short',
    label: 'Kratka politika povraćaja',
    description: 'Prikazuje se na strani za povraćaj i u uslovima kupovine.',
    field: 'textarea',
    defaultPublic: true,
  },
  {
    section: 'Firma',
    key: 'company_name',
    label: 'Naziv firme',
    description: 'Prikazuje se na kontakt strani, pravnim stranama i koristi se kao naziv prodavca.',
    field: 'input',
    inputType: 'text',
    defaultPublic: true,
  },
  {
    section: 'Firma',
    key: 'company_address',
    label: 'Adresa firme',
    description: 'Prikazuje se na kontakt strani, u footeru i pravnim stranama kada je uneta.',
    field: 'textarea',
    defaultPublic: true,
  },
  {
    section: 'Firma',
    key: 'company_registration_number',
    label: 'Matični broj firme',
    description: 'Prikazuje se na kontakt strani i pravnim stranama kada je unet.',
    field: 'input',
    inputType: 'text',
    defaultPublic: true,
  },
  {
    section: 'Firma',
    key: 'company_tax_id',
    label: 'PIB firme',
    description: 'Prikazuje se na kontakt strani i pravnim stranama kada je unet.',
    field: 'input',
    inputType: 'text',
    defaultPublic: true,
  },
  {
    section: 'Brend',
    key: 'logo_url',
    label: 'URL logotipa',
    description: 'Koristi se za SEO metadata i strukturirane podatke sajta.',
    field: 'input',
    inputType: 'url',
    defaultPublic: true,
  },
];

function message(error: unknown) {
  if (error instanceof ApiError) {
    if (error.details && typeof error.details === 'object' && 'detail' in error.details) {
      return String((error.details as { detail?: unknown }).detail);
    }
    return `Admin API greška (${error.status}).`;
  }
  return 'Podešavanja trenutno nisu dostupna.';
}

const sections: SettingSection[] = ['Kontakt', 'Social', 'Dostava', 'Povraćaj', 'Firma', 'Brend'];

export function AdminSettingsPanel() {
  const [settings, setSettings] = useState<Record<string, StoreSetting>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getAdminSettings();
      setSettings(Object.fromEntries(rows.map((row) => [row.key, row])));
    } catch (err) {
      setError(message(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!success) return;
    const timeout = window.setTimeout(() => setSuccess(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [success]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const form = new FormData(event.currentTarget);
    try {
      await Promise.all(
        publicSettings.map((setting) => updateAdminSetting(setting.key, {
          value: String(form.get(setting.key) || ''),
          value_type: 'string',
          is_public: form.get(`${setting.key}_is_public`) === 'on',
        })),
      );
      setSuccess('Podešavanja su sačuvana.');
      await load();
    } catch (err) {
      setError(message(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-primary">Javna podešavanja prodavnice</h2>
        <p className="mt-1 text-sm text-slate-600">Upravljajte podacima koji se prikazuju na javnom sajtu.</p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Podaci označeni kao javni prikazuju se na sajtu i mogu biti vidljivi kupcima i pretraživačima.
      </div>

      {loading && <div className="border border-slate-200 bg-white p-6">Učitavanje podešavanja...</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">{success}</div>}

      {!loading && (
        <form onSubmit={submit} className="space-y-5 bg-white p-4">
          {sections.map((section) => (
            <fieldset key={section} className="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-2">
              <legend className="px-2 text-sm font-bold uppercase tracking-wide text-primary">{section}</legend>
              {publicSettings.filter((setting) => setting.section === section).map((setting) => {
                const savedSetting = settings[setting.key];
                const isPublic = savedSetting?.is_public ?? setting.defaultPublic;

                return (
                  <div key={setting.key} className="rounded-lg border border-slate-100 p-4">
                    <label className="block text-sm font-semibold text-slate-900" htmlFor={setting.key}>
                      {setting.label}
                    </label>
                    <p className="mt-1 text-xs text-slate-500">{setting.description}</p>
                    {setting.field === 'textarea' ? (
                      <textarea
                        id={setting.key}
                        name={setting.key}
                        defaultValue={savedSetting?.value ?? ''}
                        rows={4}
                        disabled={saving}
                        className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100"
                      />
                    ) : (
                      <input
                        id={setting.key}
                        name={setting.key}
                        type={setting.inputType ?? 'text'}
                        defaultValue={savedSetting?.value ?? ''}
                        disabled={saving}
                        className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100"
                      />
                    )}
                    <label className="mt-3 flex items-start gap-2 text-sm text-slate-700">
                      <input
                        name={`${setting.key}_is_public`}
                        type="checkbox"
                        defaultChecked={isPublic}
                        disabled={saving}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span>Javno prikazuj ovaj podatak</span>
                    </label>
                    <p className="mt-2 text-xs text-slate-400">Tip vrednosti: string</p>
                  </div>
                );
              })}
            </fieldset>
          ))}
          <button disabled={saving} className="rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:bg-slate-400" type="submit">
            {saving ? 'Čuvanje...' : 'Sačuvaj podešavanja'}
          </button>
        </form>
      )}
    </section>
  );
}
