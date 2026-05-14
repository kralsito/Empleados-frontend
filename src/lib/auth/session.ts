import 'server-only'
import { cookies } from 'next/headers';
import { UserRole } from '@/lib/api/models/user/user';

export interface CurrentUser {
  id: number;
  email: string;
  role: UserRole;
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function getCurrentUserFromToken(token: string | null): CurrentUser | null {
  if (!token) return null;

  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const parsed = JSON.parse(decodeBase64Url(payload)) as {
      sub?: unknown;
      userId?: unknown;
      role?: unknown;
      exp?: unknown;
    };

    if (typeof parsed.exp === 'number' && parsed.exp * 1000 < Date.now()) {
      return null;
    }

    if (
      typeof parsed.sub !== 'string' ||
      typeof parsed.userId !== 'number' ||
      (parsed.role !== 'ADMIN' && parsed.role !== 'USER')
    ) {
      return null;
    }

    return {
      id: parsed.userId,
      email: parsed.sub,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export async function getAccessToken() {
    return (await (cookies())).get("access_token")?.value ?? null;
}

export async function getCurrentUser() {
  return getCurrentUserFromToken(await getAccessToken());
}

export async function setAccessToken({ token }: { token: string }) {
  const cookieStore = await cookies()
  cookieStore.set("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
  });
}

export async function clearAccessToken() {
  const cookieStore = await cookies()
  cookieStore.delete("access_token");
}
