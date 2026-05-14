'use server';

import { createUser, CreateUserInput, deleteUser, getUsers, login, updateUser, UpdateUserInput } from '@/lib/api/calls/auth';
import { Auth, LoginInput } from '@/lib/api/models/auth/auth';
import { setAccessToken, clearAccessToken } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

export async function loginAction({ email, password }: LoginInput): Promise<Auth> {
  const auth = await login({ email, password });
  await setAccessToken({ token: auth.accessToken });
  return auth;
}

export async function logoutAction() {
  await clearAccessToken();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'No se pudo crear el usuario';
}

export async function crearUsuarioAction(data: CreateUserInput) {
  try {
    await createUser(data);
    const users = await getUsers();
    revalidatePath('/admin/usuarios');
    return { success: true, data: users };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function actualizarUsuarioAction(id: number, data: UpdateUserInput) {
  try {
    const user = await updateUser(id, data);
    revalidatePath('/admin/usuarios');
    return { success: true, data: user };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function eliminarUsuarioAction(id: number) {
  try {
    await deleteUser(id);
    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
