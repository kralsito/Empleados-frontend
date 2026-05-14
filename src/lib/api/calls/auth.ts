import 'server-only'
import { apiRequest } from '../api';
import { Auth, LoginInput  } from '../models/auth/auth';
import { User } from '../models/user/user';

export type CreateUserInput = LoginInput;
export interface UpdateUserInput {
  email: string;
  password?: string;
}

export async function login({ email, password }: LoginInput): Promise<Auth> {
  const response = await apiRequest<Auth>('/auth/login', 'POST', { email, password }, 'application/json', false);
  if (!response.data) {
    throw new Error('Error al consultar a la api');
  }
  return response.data;
}

export async function createUser({ email, password }: CreateUserInput): Promise<void> {
  await apiRequest('/auth/users', 'POST', { email, password });
}

export async function getUsers(): Promise<User[]> {
  const response = await apiRequest<User[]>('/auth/users', 'GET');

  if (!response.data) {
    throw new Error('Error al obtener los usuarios');
  }

  return response.data;
}

export async function updateUser(id: number, data: UpdateUserInput): Promise<User> {
  const response = await apiRequest<User>(`/auth/users/${id}`, 'PUT', data);

  if (!response.data) {
    throw new Error('Error al actualizar el usuario');
  }

  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await apiRequest(`/auth/users/${id}`, 'DELETE');
}
