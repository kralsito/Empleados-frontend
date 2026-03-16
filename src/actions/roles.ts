'use server';

import { createRol, deleteRol, updateRol } from '@/lib/api/calls/roles';
import { NuevoRolInput } from '@/lib/api/models/role/role';
import { revalidatePath } from 'next/cache';

function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'Error al guardar el rol';
}

export async function crearRolAction(data: NuevoRolInput) {
    try {
        const resultado = await createRol(data);
        revalidatePath('/configuracion/roles');
        revalidatePath('/configuracion/empleados');

        return { success: true, data: resultado };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function actualizarRolAction(id: number, data: NuevoRolInput) {
    try {
        const resultado = await updateRol(id, data);
        revalidatePath('/configuracion/roles');
        revalidatePath('/configuracion/empleados');

        return { success: true, data: resultado };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function eliminarRolAction(id: number) {
    try {
        await deleteRol(id);
        revalidatePath('/configuracion/roles');
        revalidatePath('/configuracion/empleados');

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}
