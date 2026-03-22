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

function getDefaultErrorMessage(status: number): string {
  if (status === 401) return 'No autorizado. Inicia sesion nuevamente.';
  if (status === 403) return 'No tienes permisos para realizar esta accion.';
  if (status === 404) return 'Recurso no encontrado.';
  if (status >= 500) return 'Error interno del servidor.';
  return 'Error desconocido';
}

function extractErrorMessage(errorData: unknown): string | null {
  if (!errorData || typeof errorData !== 'object') return null;

  if ('message' in errorData && typeof errorData.message === 'string' && errorData.message.trim()) {
    return errorData.message;
  }

  if ('error' in errorData && typeof errorData.error === 'string' && errorData.error.trim()) {
    return errorData.error;
  }

  return null;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  method: HttpMethod = 'GET',
  body: unknown = null,
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
    options.body = contentType === 'application/json'
      ? JSON.stringify(body)
      : body as BodyInit;
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    let errorData: unknown = null;
    const contentTypeHeader = res.headers.get('content-type') ?? '';

    if (contentTypeHeader.includes('application/json')) {
      try {
        errorData = await res.json();
      } catch {
        errorData = null;
      }
    } else {
      try {
        const text = await res.text();
        if (text.trim()) {
          throw new Error(text);
        }
      } catch {
        // no-op: fallback message below
      }
    }

    const apiMessage = extractErrorMessage(errorData);
    throw new Error(apiMessage ?? getDefaultErrorMessage(res.status));
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
