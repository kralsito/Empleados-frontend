import { getRoles } from '@/lib/api/calls/roles';
import { Rol } from '@/lib/api/models/role/role';
import RoleForm from './components/RoleForm';

function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'No se pudieron cargar los roles.';
}

export default async function RolesPage() {
    let roles: Rol[] = [];
    let initialError: string | undefined;

    try {
        roles = await getRoles();
    } catch (error: unknown) {
        initialError = getErrorMessage(error);
    }

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="font-russo text-3xl tracking-[0.08em] text-black">Roles</h1>
                <p className="text-sm text-black/60">Alta, edicion y baja de roles.</p>
            </div>
            <RoleForm initialRoles={roles} initialError={initialError} />
        </section>
    );
}
