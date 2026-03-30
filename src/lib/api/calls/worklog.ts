import 'server-only';
import { apiRequest } from '../api';
import { NuevoWorklogInput, Worklog, WorklogDetail } from '../models/worklog/worklog';

export async function getWorklogsByEmployee(employeeId: number): Promise<Worklog[]> {
    const response = await apiRequest<Worklog[]>(`/work-logs/employee/${employeeId}`, 'GET');

    if (!response.data) {
        throw new Error('Error al obtener los worklogs del empleado');
    }

    return response.data;
}

export async function getWorklogDetailsByEmployee(employeeId: number): Promise<WorklogDetail[]> {
    const response = await apiRequest<WorklogDetail[]>(`/payments/employee/${employeeId}/worklogs`, 'GET');

    if (!response.data) {
        throw new Error('Error al obtener el detalle de worklogs del empleado');
    }

    return response.data;
}

export async function createWorklog(data: NuevoWorklogInput): Promise<Worklog> {
    const response = await apiRequest<Worklog>('/work-logs', 'POST', data);

    if (!response.data) {
        throw new Error('Error al crear el worklog en la API');
    }

    return response.data;
}

export async function updateWorklog(id: number, data: NuevoWorklogInput): Promise<Worklog> {
    const response = await apiRequest<Worklog>(`/work-logs/${id}`, 'PUT', data);

    if (!response.data) {
        throw new Error('Error al actualizar el worklog en la API');
    }

    return response.data;
}

export async function deleteWorklog(id: number): Promise<void> {
    await apiRequest(`/work-logs/${id}`, 'DELETE');
}

