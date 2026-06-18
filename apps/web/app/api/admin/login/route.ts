import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const apiBaseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const tokenMaxAge = Number(process.env.ADMIN_TOKEN_MAX_AGE_SECONDS ?? 60 * 60 * 24);

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  if (!payload?.email || !payload.password) return NextResponse.json({ detail: 'Email and password are required.' }, { status: 400 });

  const body = new URLSearchParams({ username: payload.email, password: payload.password });
  const response = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });

  if (!response.ok) {
    const details = await response.json().catch(async () => ({ detail: await response.text() }));
    return NextResponse.json(details, { status: response.status });
  }

  const data = await response.json() as { access_token?: string; token_type?: string };
  if (!data.access_token) return NextResponse.json({ detail: 'Backend did not return an access token.' }, { status: 502 });

  (await cookies()).set('simeonshop_admin_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: tokenMaxAge,
  });

  return NextResponse.json({ ok: true, token_type: data.token_type ?? 'bearer' });
}
