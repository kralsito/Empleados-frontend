import 'server-only';
import { apiRequest } from '../api';
import { NuevoRolInput, Rol } from '../models/role/role';

export async function createRol(data: NuevoRolInput): Promise<Rol> {
    const response = await apiRequest<Rol>('/role', 'POST', data);

    if (!response.data) {
        throw new Error('Error al crear el rol en la API');
    }

    return response.data;
}

export async function getRoles(): Promise<Rol[]> {
    const response = await apiRequest<Rol[]>('/role', 'GET');

    if (!response.data) {
        throw new Error('Error al obtener los roles');
    }

    return response.data;
}

export async function updateRol(id: number, data: NuevoRolInput): Promise<Rol> {
    const response = await apiRequest<Rol>(`/role/${id}`, 'PUT', data);

    if (!response.data) {
        throw new Error('Error al actualizar el rol en la API');
    }

    return response.data;
}

export async function deleteRol(id: number): Promise<void> {
    await apiRequest(`/role/${id}`, 'DELETE');
}
