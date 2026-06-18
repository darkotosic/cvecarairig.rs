import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const apiBaseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const blockedHeaders = new Set(['host', 'connection', 'content-length', 'cookie']);

type Context = { params: Promise<{ path?: string[] }> };

function isMutation(method: string) {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
}

function addOrigin(origins: Set<string>, value?: string | null) {
  if (!value) return;
  value
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean)
    .forEach((item) => origins.add(item));
}

function allowedAdminOrigins() {
  const origins = new Set<string>();
  addOrigin(origins, process.env.ADMIN_ALLOWED_ORIGINS);
  addOrigin(origins, process.env.NEXT_PUBLIC_SITE_URL);

  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
  }

  return origins;
}

function hasValidOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')?.replace(/\/$/, '');
  if (!origin) return process.env.NODE_ENV !== 'production';
  return allowedAdminOrigins().has(origin);
}

async function proxy(request: NextRequest, context: Context) {
  const { path = [] } = await context.params;
  const upstreamPath = `/${path.join('/')}`;
  if (!upstreamPath.startsWith('/api/v1/admin')) {
    return NextResponse.json({ detail: 'Admin proxy only allows /api/v1/admin paths.' }, { status: 403 });
  }

  // Admin auth token is httpOnly; mutation requests are additionally origin-checked.
  if (isMutation(request.method) && !hasValidOrigin(request)) {
    return NextResponse.json({ detail: 'Invalid admin request origin.' }, { status: 403 });
  }

  const token = (await cookies()).get('cvecarairig_admin_token')?.value;
  if (!token) return NextResponse.json({ detail: 'Admin session is missing.' }, { status: 401 });

  const headers = new Headers();
  request.headers.forEach((value, key) => { if (!blockedHeaders.has(key.toLowerCase())) headers.set(key, value); });
  headers.set('Authorization', `Bearer ${token}`);

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody ? await request.arrayBuffer() : undefined;
  const contentType = headers.get('Content-Type') ?? '';
  const hasRealBody = body !== undefined && body.byteLength > 0;
  const isMultipart = contentType.toLowerCase().includes('multipart/form-data');
  if (!headers.has('Content-Type') && hasRealBody && !isMultipart) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiBaseUrl}${upstreamPath}${request.nextUrl.search}`, {
    method: request.method,
    headers,
    body,
    cache: 'no-store',
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');
  return new NextResponse(response.body, { status: response.status, headers: responseHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
