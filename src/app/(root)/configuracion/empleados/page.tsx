import { getEmpleados } from '@/lib/api/calls/employee';
import { getRoles } from '@/lib/api/calls/roles';
import { Empleado } from '@/lib/api/models/employee/employee';
import { Rol } from '@/lib/api/models/role/role';
import EmployeForm from './components/EmployeForm';

function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'No se pudieron cargar los empleados.';
}

export default async function EmpleadosPage() {
    let empleados: Empleado[] = [];
    let roles: Rol[] = [];
    let initialError: string | undefined;

    try {
        [empleados, roles] = await Promise.all([getEmpleados(), getRoles()]);
    } catch (error: unknown) {
        initialError = getErrorMessage(error);
    }

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="font-russo text-3xl tracking-[0.08em] text-black">Empleados</h1>
                <p className="text-sm text-black/60">Alta, edicion y baja de empleados.</p>
            </div>
            <EmployeForm initialEmployees={empleados} roles={roles} initialError={initialError} />
        </section>
    );
}
