export const GLOBAL_CTA_PHONE = '+381629053553';

export function normalizeTelHref(phone: string) {
  const trimmed = phone.trim();
  const prefix = trimmed.startsWith('+') ? '+' : '';
  return `${prefix}${trimmed.replace(/[^\d]/g, '')}`;
}
