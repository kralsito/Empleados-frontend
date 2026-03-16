import 'server-only';
import { apiRequest } from '../api';
import { NuevoEmpleadoInput, Empleado } from '../models/employee/employee';

export async function createEmpleado(data: NuevoEmpleadoInput): Promise<Empleado> {
    const response = await apiRequest<Empleado>('/employee', 'POST', data);

    if (!response.data) {
        throw new Error('Error al crear el empleado en la API');
    }

    return response.data;
}

export async function getEmpleados(): Promise<Empleado[]> {
    const response = await apiRequest<Empleado[]>('/employee', 'GET');

    if (!response.data) {
        throw new Error('Error al obtener los empleados');
    }

    return response.data;
}

export async function updateEmpleado(id: number, data: NuevoEmpleadoInput): Promise<Empleado> {
    const response = await apiRequest<Empleado>(`/employee/${id}`, 'PUT', data);

    if (!response.data) {
        throw new Error('Error al actualizar el empleado en la API');
    }

    return response.data;
}

export async function deleteEmpleado(id: number): Promise<void> {
    await apiRequest(`/employee/${id}`, 'DELETE');
}
