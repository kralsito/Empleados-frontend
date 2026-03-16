'use server';

import { createEmpleado, deleteEmpleado, updateEmpleado } from '@/lib/api/calls/employee';
import { NuevoEmpleadoInput } from '@/lib/api/models/employee/employee';
import { revalidatePath } from 'next/cache';

function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'Error al guardar el empleado';
}

export async function crearEmpleadoAction(data: NuevoEmpleadoInput) {
    try {
        const resultado = await createEmpleado(data);
        revalidatePath('/configuracion/empleados');

        return { success: true, data: resultado };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function actualizarEmpleadoAction(id: number, data: NuevoEmpleadoInput) {
    try {
        const resultado = await updateEmpleado(id, data);
        revalidatePath('/configuracion/empleados');

        return { success: true, data: resultado };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function eliminarEmpleadoAction(id: number) {
    try {
        await deleteEmpleado(id);
        revalidatePath('/configuracion/empleados');

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}
