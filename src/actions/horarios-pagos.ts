'use server';

import { revalidatePath } from 'next/cache';
import { getEmpleados } from '@/lib/api/calls/employee';
import { applyPayment, AplicarPagoFormInput, getPaymentsByEmployee } from '@/lib/api/calls/payment';
import {
    createWorklog,
    deleteWorklog,
    getWorklogDetailsByEmployee,
    updateWorklog,
} from '@/lib/api/calls/worklog';
import { NuevoWorklogInput } from '@/lib/api/models/worklog/worklog';

function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'Ocurrio un error inesperado.';
}

function revalidateHorariosPagos(employeeId?: number) {
    revalidatePath('/horarios-pagos');

    if (employeeId) {
        revalidatePath(`/horarios-pagos/${employeeId}`);
    }
}

export async function listarEmpleadosHorariosAction() {
    try {
        const empleados = await getEmpleados();
        return { success: true, data: empleados };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function obtenerEmpleadoHorariosAction(employeeId: number) {
    try {
        const [empleados, worklogs, payments] = await Promise.all([
            getEmpleados(),
            getWorklogDetailsByEmployee(employeeId),
            getPaymentsByEmployee(employeeId),
        ]);

        const empleado = empleados.find((item) => item.id === employeeId) ?? null;
        return {
            success: true,
            data: {
                employee: empleado,
                worklogs,
                payments,
            },
        };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function buscarPagosEmpleadoAction(
    employeeId: number,
    filters?: { from?: string; to?: string },
) {
    try {
        const payments = await getPaymentsByEmployee(employeeId, filters);
        return { success: true, data: payments };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function aplicarPagoAction(data: AplicarPagoFormInput) {
    try {
        const resultado = await applyPayment(data);
        revalidateHorariosPagos(data.employeeId);

        return { success: true, data: resultado };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function crearWorklogAction(data: NuevoWorklogInput) {
    try {
        const resultado = await createWorklog(data);
        revalidateHorariosPagos(data.employeeId);

        return { success: true, data: resultado };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function actualizarWorklogAction(worklogId: number, data: NuevoWorklogInput) {
    try {
        const resultado = await updateWorklog(worklogId, data);
        revalidateHorariosPagos(data.employeeId);

        return { success: true, data: resultado };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function eliminarWorklogAction(worklogId: number, employeeId: number) {
    try {
        await deleteWorklog(worklogId);
        revalidateHorariosPagos(employeeId);

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}
