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
  business_hours: optionalEnv(process.env.NEXT_PUBLIC_BUSINESS_HOURS),
  service_area: optionalEnv(process.env.NEXT_PUBLIC_SERVICE_AREA),
  same_day_cutoff: optionalEnv(process.env.NEXT_PUBLIC_SAME_DAY_CUTOFF),
  payment_methods: optionalEnv(process.env.NEXT_PUBLIC_PAYMENT_METHODS),
  google_maps_url: optionalEnv(process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL),
  whatsapp_url: optionalEnv(process.env.NEXT_PUBLIC_WHATSAPP_URL),
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
