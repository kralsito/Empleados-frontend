import 'server-only';
import { getAccessToken } from "@/lib/auth/session";

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'

export interface ApiResponse<T> {
  data: T | null;
  headers: {
    totalCount: string | null;
    contentType: string | null;
  };
}

export async function apiRequest<T = any>(
  endpoint: string,
  method: HttpMethod = 'GET',
  body: any = null,
  contentType: string = 'application/json',
  requiresAuth: boolean = true
): Promise<ApiResponse<T>> {

  let token: string | null = null;

  if (requiresAuth) {
    token = await getAccessToken();
  }

  const url = new URL(`http://localhost:8080${endpoint}`);

  const options: RequestInit = {
    method,
    headers: {}
  };

  if (token) {
    (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  if (contentType === 'application/json') {
    (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  if (body) {
    options.body = contentType === 'application/json' ? JSON.stringify(body) : body;
  }

  const res = await fetch(url, options);
  
  if (!res.ok) {
    let errorData: any;
    try {
      errorData = await res.json();
    } catch {
      throw new Error('Error desconocido');
    }
    console.error(errorData);
    throw new Error(errorData.message || 'Error desconocido');
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data: T | null = isJson ? await res.json() : null;

  return {
    data,
    headers: {
      totalCount: res.headers.get('x-total-count'),
      contentType: res.headers.get('content-type'),
    }
  };
}