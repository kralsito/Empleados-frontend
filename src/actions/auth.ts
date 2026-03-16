'use server';

import { login } from '@/lib/api/calls/auth';
import { Auth, LoginInput } from '@/lib/api/models/auth/auth';
import { setAccessToken, clearAccessToken } from '@/lib/auth/session';

export async function loginAction({ email, password }: LoginInput): Promise<Auth> {
  const auth = await login({ email, password });
  await setAccessToken({ token: auth.accessToken });
  return auth;
}

export async function logoutAction() {
  await clearAccessToken();
}