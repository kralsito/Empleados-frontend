import 'server-only'
import { cookies } from 'next/headers';

export async function getAccessToken() {
    return (await (cookies())).get("access_token")?.value ?? null;
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