import { getUsers } from '@/lib/api/calls/auth';
import { User } from '@/lib/api/models/user/user';
import UserManagement from './components/UserManagement';

function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'No se pudieron cargar los usuarios.';
}

export default async function UsuariosPage() {
    let users: User[] = [];
    let initialError: string | undefined;

    try {
        users = await getUsers();
    } catch (error: unknown) {
        initialError = getErrorMessage(error);
    }

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="font-russo text-3xl tracking-[0.08em] text-black">Usuarios</h1>
                <p className="text-sm text-black/60">Alta, edicion y baja de usuarios.</p>
            </div>

            <UserManagement initialUsers={users} initialError={initialError} />
        </section>
    );
}
