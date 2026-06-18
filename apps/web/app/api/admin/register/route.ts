import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const apiBaseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const tokenMaxAge = Number(process.env.ADMIN_TOKEN_MAX_AGE_SECONDS ?? 60 * 60 * 24);

type AdminRegisterPayload = {
  email?: string;
  full_name?: string;
  password?: string;
  bootstrap_token?: string;
};

async function responseDetails(response: Response) {
  return response.json().catch(async () => ({ detail: await response.text() }));
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null) as AdminRegisterPayload | null;

  if (!payload?.email || !payload.full_name || !payload.password || !payload.bootstrap_token) {
    return NextResponse.json(
      { detail: 'Email, full name, password and bootstrap token are required.' },
      { status: 400 },
    );
  }

  const createResponse = await fetch(`${apiBaseUrl}/api/v1/auth/bootstrap-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: payload.email,
      full_name: payload.full_name,
      password: payload.password,
      bootstrap_token: payload.bootstrap_token,
    }),
    cache: 'no-store',
  });

  if (!createResponse.ok) {
    return NextResponse.json(await responseDetails(createResponse), { status: createResponse.status });
  }

  const loginResponse = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: payload.email, password: payload.password }),
    cache: 'no-store',
  });

  if (!loginResponse.ok) {
    return NextResponse.json(await responseDetails(loginResponse), { status: loginResponse.status });
  }

  const data = await loginResponse.json() as { access_token?: string; token_type?: string };

  if (!data.access_token) {
    return NextResponse.json({ detail: 'Backend did not return an access token.' }, { status: 502 });
  }

  (await cookies()).set('cvecarairig_admin_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: tokenMaxAge,
  });

  return NextResponse.json({ ok: true, token_type: data.token_type ?? 'bearer' });
}
