import storeData from '@/data/store.json';
import type { Store } from './types';
export const store = storeData as Store;
export function normalizeTelHref(phone: string) { const value = phone.trim(); return `${value.startsWith('+') ? '+' : ''}${value.replace(/[^\d]/g, '')}`; }
