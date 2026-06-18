const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type ApiFetchOptions = RequestInit & { revalidate?: number; token?: string; publicGet?: boolean };
type AdminFetchOptions = RequestInit & { revalidate?: number };

export async function apiFetch<T>(path: string, init: ApiFetchOptions = {}): Promise<T> {
  const method = init.method ?? 'GET';
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && method !== 'GET' && init.body !== undefined && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (init.token) headers.set('Authorization', `Bearer ${init.token}`);

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
    cache: method === 'GET' && init.publicGet !== false ? undefined : 'no-store',
    next: method === 'GET' && init.publicGet !== false ? { revalidate: init.revalidate ?? 60 } : undefined,
  });

  if (!response.ok) {
    let details: unknown;
    try { details = await response.json(); } catch { details = await response.text(); }
    throw new ApiError(`API request failed with status ${response.status}`, response.status, details);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type Category = { id: number; name: string; slug: string; description?: string | null; sort_order: number; is_active: boolean };
export type ProductImage = { id: number; image_url: string; alt_text?: string | null; sort_order: number; is_primary: boolean };
export type ProductVariant = { id: number; sku?: string | null; size?: string | null; color?: string | null; price_cents?: number | null; stock_quantity: number; is_active: boolean };
export type Product = {
  id: number; name: string; slug: string; sku?: string | null; description?: string | null; category_id?: number | null; category?: Category | null;
  short_description?: string | null; price_cents: number; compare_at_price_cents?: number | null; currency: string; image_url?: string | null;
  stock_quantity: number; sort_order: number; effective_stock_quantity?: number; material?: string | null; care_instructions?: string | null; arrangement_type?: string | null; occasion?: string | null; color_palette?: string | null; flower_count?: number | null; is_same_day_delivery?: boolean; lead_time_hours?: number; seo_title?: string | null; seo_description?: string | null;
  is_active: boolean; images: ProductImage[]; variants: ProductVariant[]; created_at: string; updated_at: string;
};
export type ProductListResponse = { items: Product[]; total: number; page: number; page_size: number; pages: number };
export type CartLine = { lineId: string; productId: number; variantId?: number; name: string; slug: string; imageUrl?: string | null; sku?: string | null; variantLabel?: string; unitPriceCents: number; quantity: number; stockQuantity: number; currency: string };
export type GuestCheckoutPayload = { customer_name: string; customer_email?: string; customer_phone: string; shipping_city: string; shipping_postal_code: string; shipping_address: string; note?: string; recipient_name?: string; recipient_phone?: string; delivery_date?: string; delivery_time_window?: string; card_message?: string; occasion?: string; accepted_terms: boolean; source?: string; idempotency_key?: string; items: { product_id: number; variant_id?: number; quantity: number }[] };
export type OrderStatusEvent = { id: number; old_status?: string | null; new_status: string; actor_user_id?: number | null; note?: string | null; created_at: string };
export type Order = { id: number; order_number: string; status: string; total_cents: number; currency: string; customer_name: string; customer_email?: string | null; customer_phone: string; shipping_city: string; shipping_postal_code: string; shipping_address: string; note?: string | null; recipient_name?: string | null; recipient_phone?: string | null; delivery_date?: string | null; delivery_time_window?: string | null; card_message?: string | null; occasion?: string | null; idempotency_key?: string | null; confirmed_at?: string | null; packed_at?: string | null; shipped_at?: string | null; delivered_at?: string | null; cancelled_at?: string | null; internal_note?: string | null; accepted_terms_at?: string | null; customer_ip?: string | null; user_agent?: string | null; source?: string | null; created_at: string; updated_at?: string; status_events?: OrderStatusEvent[]; items: { id: number; product_name: string; product_sku?: string | null; product_id?: number | null; unit_price_cents?: number; quantity: number; total_price_cents: number; variant_id?: number | null; product_slug?: string | null; product_image_url?: string | null; variant_label?: string | null; currency?: string; discount_cents?: number; tax_cents?: number }[] };

export type PublicStoreSettings = {
  store_phone?: string | null;
  store_email?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  delivery_note?: string | null;
  return_policy_short?: string | null;
  company_name?: string | null;
  company_address?: string | null;
  company_registration_number?: string | null;
  company_tax_id?: string | null;
  logo_url?: string | null;
  business_hours?: string | null;
  service_area?: string | null;
  same_day_cutoff?: string | null;
  payment_methods?: string | null;
  google_maps_url?: string | null;
  whatsapp_url?: string | null;
};

export type LowStockProduct = { id: number; name: string; slug: string; sku?: string | null; stock_quantity: number; variant_stock_quantity: number; effective_stock_quantity: number };
export type DailyRevenue = { date: string; revenue_cents: number };
export type DailyOrders = { date: string; orders_count: number };
export type TopProduct = { product_name: string; quantity_sold: number; revenue_cents: number };
export type AdminSummary = { new_orders: number; confirmed_orders: number; packed_orders: number; shipped_orders: number; delivered_orders: number; cancelled_orders: number; active_products: number; out_of_stock_products: number; total_revenue_cents: number; orders_count_period: number; average_order_value_cents: number; latest_orders: Order[]; low_stock_products: LowStockProduct[]; revenue_by_day: DailyRevenue[]; orders_by_day: DailyOrders[]; top_products: TopProduct[] };
export type AdminOrderListResponse = { items: Order[]; total: number; page: number; page_size: number; pages: number };
export type CsvExportResult = { blob: Blob; filename: string; rows: number; truncated: boolean };

const paramsToQuery = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== '') search.set(key, String(value)); });
  const q = search.toString();
  return q ? `?${q}` : '';
};

export const getProducts = (params: Record<string, string | number | undefined> = {}) => apiFetch<ProductListResponse>(`/api/v1/products/${paramsToQuery(params)}`, { publicGet: true });
export const getProduct = (slug: string) => apiFetch<Product>(`/api/v1/products/${encodeURIComponent(slug)}`, { publicGet: true });
export const getPublicStoreSettings = () => apiFetch<PublicStoreSettings>('/api/v1/store/settings', { publicGet: true, revalidate: 120 });
export const getCategories = () => apiFetch<Category[]>('/api/v1/categories/', { publicGet: true });
export const createGuestOrder = (payload: GuestCheckoutPayload) => apiFetch<Order>('/api/v1/orders/guest-checkout', { method: 'POST', body: JSON.stringify(payload) });
export async function adminFetch<T>(path: string, init: AdminFetchOptions = {}): Promise<T> {
  const method = init.method ?? 'GET';
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && method !== 'GET' && init.body !== undefined && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`/api/admin/proxy/api/v1/admin${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }

    if ((response.status === 401 || response.status === 403) && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cvecarairig:admin-auth-expired'));
    }

    throw new ApiError(`Admin request failed with status ${response.status}`, response.status, details);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const adminLogin = (email: string, password: string) => fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }).then(async (response) => { if (!response.ok) { let details: unknown; try { details = await response.json(); } catch { details = await response.text(); } throw new ApiError('Admin login failed', response.status, details); } return response.json() as Promise<{ ok: boolean; token_type: string }>; });
export const adminRegister = (fullName: string, email: string, password: string, bootstrapToken: string) => fetch('/api/admin/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ full_name: fullName, email, password, bootstrap_token: bootstrapToken }) }).then(async (response) => { if (!response.ok) { let details: unknown; try { details = await response.json(); } catch { details = await response.text(); } throw new ApiError('Admin register failed', response.status, details); } return response.json() as Promise<{ ok: boolean; token_type: string }>; });
export const adminLogout = () => fetch('/api/admin/logout', { method: 'POST' });
export const getAdminSummary = (periodDays = 30) => adminFetch<AdminSummary>(`/summary${paramsToQuery({ period_days: periodDays })}`);
export const getAdminOrders = (params: Record<string, string | number | undefined> = {}) => adminFetch<AdminOrderListResponse>(`/orders${paramsToQuery(params)}`);
function filenameFromContentDisposition(header: string | null) {
  if (!header) return 'orders-export.csv';
  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1].replace(/["\\]/g, ''));
  const match = header.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? 'orders-export.csv';
}

export async function exportAdminOrdersCsv(params: Record<string, string | number | undefined> = {}): Promise<CsvExportResult> {
  const response = await fetch(`/api/admin/proxy/api/v1/admin/orders/export.csv${paramsToQuery(params)}`, { cache: 'no-store' });
  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }
    if ((response.status === 401 || response.status === 403) && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cvecarairig:admin-auth-expired'));
    }
    throw new ApiError(`Admin CSV export failed with status ${response.status}`, response.status, details);
  }
  return {
    blob: await response.blob(),
    filename: filenameFromContentDisposition(response.headers.get('content-disposition')),
    rows: Number(response.headers.get('x-export-rows') ?? 0),
    truncated: response.headers.get('x-export-truncated') === 'true',
  };
}

export const updateAdminOrderStatus = (orderId: number, status: string) => adminFetch<Order>(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export type HealthResponse = { status: string; message: string; version: string; environment: string };

export type AdminProductPayload = Partial<Omit<Product, 'id' | 'category' | 'images' | 'variants' | 'created_at' | 'updated_at' | 'effective_stock_quantity'>> & { name?: string; price_cents?: number };
export type AdminCategoryPayload = Partial<Omit<Category, 'id' | 'slug' | 'created_at' | 'updated_at'>> & { name?: string; slug?: string | null };
export type AdminProductImagePayload = { image_url?: string; alt_text?: string | null; sort_order?: number; is_primary?: boolean };
export type AdminProductVariantPayload = { sku?: string | null; size?: string | null; color?: string | null; price_cents?: number | null; stock_quantity?: number; is_active?: boolean };
export type AuditLogItem = { id: number; actor_user_id?: number | null; action: string; entity_type: string; entity_id?: string | null; metadata_json?: string | null; created_at: string; };
export type AuditLogResponse = { items: AuditLogItem[]; total: number; page: number; page_size: number; };

export type StoreSetting = { id: number; key: string; value?: string | null; value_type: string; is_public: boolean; created_at: string; updated_at: string };
export type StoreSettingPayload = { value?: string | null; value_type?: string; is_public?: boolean };

export const getAdminProducts = (params: Record<string, string | number | undefined> = {}) => adminFetch<ProductListResponse>(`/products${paramsToQuery(params)}`);
export const createAdminProduct = (payload: AdminProductPayload) => adminFetch<Product>('/products', { method: 'POST', body: JSON.stringify(payload) });
export const updateAdminProduct = (productId: number, payload: AdminProductPayload) => adminFetch<Product>(`/products/${productId}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteAdminProduct = (productId: number) => adminFetch<void>(`/products/${productId}`, { method: 'DELETE' });
export const getAdminCategories = () => adminFetch<Category[]>('/categories');
export const createAdminCategory = (payload: AdminCategoryPayload) => adminFetch<Category>('/categories', { method: 'POST', body: JSON.stringify(payload) });
export const updateAdminCategory = (categoryId: number, payload: AdminCategoryPayload) => adminFetch<Category>(`/categories/${categoryId}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteAdminCategory = (categoryId: number) => adminFetch<void>(`/categories/${categoryId}`, { method: 'DELETE' });
export const createAdminProductImage = (productId: number, payload: AdminProductImagePayload) => adminFetch<ProductImage>(`/products/${productId}/images`, { method: 'POST', body: JSON.stringify(payload) });
export const updateAdminProductImage = (productId: number, imageId: number, payload: AdminProductImagePayload) => adminFetch<ProductImage>(`/products/${productId}/images/${imageId}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteAdminProductImage = (productId: number, imageId: number) => adminFetch<void>(`/products/${productId}/images/${imageId}`, { method: 'DELETE' });
export const setPrimaryAdminProductImage = (productId: number, imageId: number) => adminFetch<ProductImage>(`/products/${productId}/images/${imageId}/primary`, { method: 'PATCH' });
export const createAdminProductVariant = (productId: number, payload: AdminProductVariantPayload) => adminFetch<ProductVariant>(`/products/${productId}/variants`, { method: 'POST', body: JSON.stringify(payload) });
export const updateAdminProductVariant = (productId: number, variantId: number, payload: AdminProductVariantPayload) => adminFetch<ProductVariant>(`/products/${productId}/variants/${variantId}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteAdminProductVariant = (productId: number, variantId: number) => adminFetch<ProductVariant>(`/products/${productId}/variants/${variantId}`, { method: 'DELETE' });
export const getAdminSettings = () => adminFetch<StoreSetting[]>('/settings');
export const updateAdminSetting = (key: string, payload: StoreSettingPayload) => adminFetch<StoreSetting>(`/settings/${encodeURIComponent(key)}`, { method: 'PATCH', body: JSON.stringify(payload) });

export const updateAdminOrderInternalNote = (orderId: number, internalNote: string | null) => adminFetch<Order>(`/orders/${orderId}/internal-note`, { method: 'PATCH', body: JSON.stringify({ internal_note: internalNote }) });
export const getAdminAuditLogs = (params: Record<string, string | number | undefined> = {}) => adminFetch<AuditLogResponse>(`/audit-logs${paramsToQuery(params)}`);
export const uploadAdminProductImage = (productId: number, formData: FormData) => adminFetch<ProductImage>(`/products/${productId}/images/upload`, { method: 'POST', body: formData });
