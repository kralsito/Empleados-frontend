'use client';

import { actualizarUsuarioAction, crearUsuarioAction, eliminarUsuarioAction } from '@/actions/auth';
import { useToast } from '@/components/ui/toast-provider';
import { User } from '@/lib/api/models/user/user';
import { useEffect, useState, useTransition } from 'react';

type FormState = {
    email: string;
    password: string;
};

type UserManagementProps = {
    initialUsers: User[];
    initialError?: string;
};

const emptyForm: FormState = {
    email: '',
    password: '',
};

function sortUsers(items: User[]) {
    return [...items].sort((a, b) => a.email.localeCompare(b.email, 'es', { sensitivity: 'base' }));
}

function UserModal({
    open,
    mode,
    form,
    error,
    pending,
    onClose,
    onChange,
    onSubmit,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    form: FormState;
    error: string | null;
    pending: boolean;
    onClose: () => void;
    onChange: (field: keyof FormState, value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
    useEffect(() => {
        if (!open) return;

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape' && !pending) {
                onClose();
            }
        }

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [open, pending, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8">
            <div className="absolute inset-0" onClick={pending ? undefined : onClose} />
            <div className="relative z-10 w-full max-w-lg rounded-4xl border border-black/10 bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.2)] sm:p-7">
                <div className="flex items-start justify-between gap-4 border-b border-black/8 pb-5">
                    <h2 className="font-russo text-2xl tracking-[0.08em] text-black">
                        {mode === 'create' ? 'Agregar usuario' : 'Editar usuario'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={pending}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 text-black/70 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Cerrar"
                    >
                        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M5 5l10 10" />
                            <path d="M15 5 5 15" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="admin-user-email" className="text-sm font-semibold text-black">
                            Email
                        </label>
                        <input
                            id="admin-user-email"
                            type="email"
                            value={form.email}
                            onChange={(event) => onChange('email', event.target.value)}
                            placeholder="cliente@email.com"
                            required
                            className="rounded-2xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm text-black outline-none focus:border-[#e30613] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,6,19,0.08)]"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="admin-user-password" className="text-sm font-semibold text-black">
                            Contrasena
                        </label>
                        <input
                            id="admin-user-password"
                            type="password"
                            value={form.password}
                            onChange={(event) => onChange('password', event.target.value)}
                            placeholder={mode === 'create' ? 'Minimo 6 caracteres' : 'Dejar vacia para mantenerla'}
                            required={mode === 'create'}
                            className="rounded-2xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm text-black outline-none focus:border-[#e30613] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,6,19,0.08)]"
                        />
                    </div>

                    {error ? (
                        <div className="rounded-2xl border border-[#e30613]/18 bg-[#e30613]/6 px-4 py-3 text-sm text-[#70000b]">
                            {error}
                        </div>
                    ) : null}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={pending}
                            className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold text-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={pending}
                            className="rounded-2xl bg-[#e30613] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(227,6,19,0.24)] hover:bg-[#c70511] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {pending ? 'Guardando...' : mode === 'create' ? 'Agregar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function UserManagement({ initialUsers, initialError }: UserManagementProps) {
    const [users, setUsers] = useState(() => sortUsers(initialUsers));
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [feedback, setFeedback] = useState<string | null>(initialError ?? null);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();

    function openCreateModal() {
        setMode('create');
        setSelectedUser(null);
        setForm(emptyForm);
        setFeedback(null);
        setOpen(true);
    }

    function openEditModal(user: User) {
        setMode('edit');
        setSelectedUser(user);
        setForm({ email: user.email, password: '' });
        setFeedback(null);
        setOpen(true);
    }

    function closeModal() {
        if (isPending) return;

        setOpen(false);
        setSelectedUser(null);
        setForm(emptyForm);
        setFeedback(initialError ?? null);
    }

    function handleFieldChange(field: keyof FormState, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function upsertUserInState(user: User) {
        setUsers((current) => {
            const exists = current.some((item) => item.id === user.id);
            const next = exists
                ? current.map((item) => (item.id === user.id ? user : item))
                : [...current, user];

            return sortUsers(next);
        });
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFeedback(null);

        const email = form.email.trim();
        const password = form.password.trim();

        if (!email) {
            setFeedback('Ingresa un email.');
            return;
        }

        if (mode === 'create' && !password) {
            setFeedback('Ingresa una contrasena.');
            return;
        }

        startTransition(async () => {
            const result =
                mode === 'create'
                    ? await crearUsuarioAction({ email, password })
                    : selectedUser
                        ? await actualizarUsuarioAction(selectedUser.id, password ? { email, password } : { email })
                        : { success: false, error: 'No se encontro el usuario a editar.' };

            if (!result.success) {
                setFeedback(result.error ?? 'No se pudo guardar el usuario.');
                showToast({ type: 'error', title: 'No se pudo guardar el usuario', description: result.error ?? 'Intenta nuevamente.' });
                return;
            }

            if (Array.isArray(result.data)) {
                setUsers(sortUsers(result.data));
            } else if (result.data) {
                upsertUserInState(result.data);
            }

            setOpen(false);
            setSelectedUser(null);
            setForm(emptyForm);
            setFeedback(null);
            showToast({ type: 'success', title: mode === 'create' ? 'Usuario creado con exito' : 'Usuario actualizado con exito' });
        });
    }

    function handleDelete(user: User) {
        const confirmed = window.confirm(`Se va a eliminar el usuario "${user.email}".`);

        if (!confirmed) return;

        setFeedback(null);
        setPendingDeleteId(user.id);

        startTransition(async () => {
            const result = await eliminarUsuarioAction(user.id);

            if (!result.success) {
                setFeedback(result.error ?? 'No se pudo eliminar el usuario.');
                setPendingDeleteId(null);
                showToast({ type: 'error', title: 'No se pudo borrar el usuario', description: result.error ?? 'Intenta nuevamente.' });
                return;
            }

            setUsers((current) => current.filter((item) => item.id !== user.id));
            setPendingDeleteId(null);
            showToast({ type: 'success', title: 'Usuario borrado con exito' });
        });
    }

    return (
        <>
            <div className="rounded-4xl border border-black/8 bg-white shadow-[0_22px_48px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col gap-4 border-b border-black/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <path d="M16 19a4 4 0 0 0-8 0" />
                                <circle cx="12" cy="10" r="3.2" />
                                <path d="M18 8v5" />
                                <path d="M20.5 10.5h-5" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-black">Listado</p>
                            <p className="text-sm text-black/55">{users.length} usuarios</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e30613] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(227,6,19,0.24)] hover:bg-[#c70511]"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                        </svg>
                        Agregar nuevo
                    </button>
                </div>

                {feedback ? (
                    <div className="border-b border-black/8 px-5 py-4 text-sm text-[#70000b] sm:px-6">
                        <div className="rounded-2xl border border-[#e30613]/18 bg-[#e30613]/6 px-4 py-3">
                            {feedback}
                        </div>
                    </div>
                ) : null}

                <div className="hidden md:block">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="border-b border-black/8 text-xs uppercase tracking-[0.16em] text-black/45">
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold">Rol</th>
                                    <th className="px-6 py-4 text-right font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user.id} className="border-b border-black/6 last:border-b-0">
                                            <td className="px-6 py-4 text-sm font-semibold text-black">{user.email}</td>
                                            <td className="px-6 py-4 text-sm text-black/68">{user.role}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(user)}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm font-semibold text-black hover:bg-black hover:text-white"
                                                    >
                                                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                            <path d="m4 20 4.5-1 8.8-8.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20z" />
                                                            <path d="M13 6.5 17.5 11" />
                                                        </svg>
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(user)}
                                                        disabled={isPending && pendingDeleteId === user.id}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-[#e30613]/16 px-3 py-2 text-sm font-semibold text-[#70000b] hover:bg-[#e30613] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                            <path d="M5 7h14" />
                                                            <path d="M9 7V5.5h6V7" />
                                                            <path d="M8 7l.7 11h6.6L16 7" />
                                                        </svg>
                                                        {isPending && pendingDeleteId === user.id ? 'Borrando...' : 'Borrar'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-10 text-center text-sm text-black/55">
                                            No hay usuarios cargados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid gap-3 p-4 md:hidden">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <article key={user.id} className="rounded-3xl border border-black/8 bg-[#fafaf8] p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="truncate text-base font-semibold text-black">{user.email}</h2>
                                        <p className="mt-1 text-sm text-black/60">{user.role}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(user)}
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 text-black hover:bg-black hover:text-white"
                                            aria-label={`Editar ${user.email}`}
                                        >
                                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                <path d="m4 20 4.5-1 8.8-8.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20z" />
                                                <path d="M13 6.5 17.5 11" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(user)}
                                            disabled={isPending && pendingDeleteId === user.id}
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e30613]/16 text-[#70000b] hover:bg-[#e30613] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                            aria-label={`Borrar ${user.email}`}
                                        >
                                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                <path d="M5 7h14" />
                                                <path d="M9 7V5.5h6V7" />
                                                <path d="M8 7l.7 11h6.6L16 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-3xl border border-black/8 bg-[#fafaf8] px-4 py-6 text-center text-sm text-black/55">
                            No hay usuarios cargados.
                        </div>
                    )}
                </div>
            </div>

            <UserModal
                open={open}
                mode={mode}
                form={form}
                error={feedback}
                pending={isPending}
                onClose={closeModal}
                onChange={handleFieldChange}
                onSubmit={handleSubmit}
            />
        </>
    );
}
