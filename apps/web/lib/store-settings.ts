import { getPublicStoreSettings, type PublicStoreSettings } from './api';

const optionalEnv = (value: string | undefined) => value?.trim() || null;

export const fallbackStoreSettings = (): PublicStoreSettings => ({
  store_phone: optionalEnv(process.env.NEXT_PUBLIC_CONTACT_PHONE),
  store_email: optionalEnv(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  instagram_url: optionalEnv(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
  facebook_url: optionalEnv(process.env.NEXT_PUBLIC_FACEBOOK_URL),
  delivery_note: optionalEnv(process.env.NEXT_PUBLIC_DELIVERY_NOTE),
  return_policy_short: optionalEnv(process.env.NEXT_PUBLIC_RETURN_POLICY_SHORT),
  company_name: optionalEnv(process.env.NEXT_PUBLIC_COMPANY_NAME),
  company_address: optionalEnv(process.env.NEXT_PUBLIC_COMPANY_ADDRESS),
  company_registration_number: optionalEnv(process.env.NEXT_PUBLIC_COMPANY_REGISTRATION_NUMBER),
  company_tax_id: optionalEnv(process.env.NEXT_PUBLIC_COMPANY_TAX_ID),
  logo_url: optionalEnv(process.env.NEXT_PUBLIC_LOGO_URL),
});

export async function loadPublicStoreSettings(): Promise<PublicStoreSettings> {
  const fallback = fallbackStoreSettings();
  try {
    const settings = await getPublicStoreSettings();
    return { ...fallback, ...settings };
  } catch {
    return fallback;
  }
}
