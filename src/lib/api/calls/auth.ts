import 'server-only'
import { apiRequest } from '../api';
import { Auth, LoginInput  } from '../models/auth/auth';

export async function login({ email, password }: LoginInput): Promise<Auth> {
  const response = await apiRequest<Auth>('/auth/login', 'POST', { email, password }, 'application/json', false);
  if (!response.data) {
    throw new Error('Error al consultar a la api');
  }
  return response.data;
}