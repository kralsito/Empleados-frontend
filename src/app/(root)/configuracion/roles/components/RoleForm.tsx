'use client';

import { useEffect, useState, useTransition } from 'react';
import {
    actualizarRolAction,
    crearRolAction,
    eliminarRolAction,
} from '@/actions/roles';
import { useToast } from '@/components/ui/toast-provider';
import { Rol } from '@/lib/api/models/role/role';

type RoleFormProps = {
    initialRoles: Rol[];
    initialError?: string;
};

type FormState = {
    name: string;
    salaryHour: string;
};

const emptyForm: FormState = {
    name: '',
    salaryHour: '',
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
    }).format(value);
}

function sortRoles(items: Rol[]) {
    return [...items].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
}

function RoleModal({
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
        if (!open) {
            return;
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape' && !pending) {
                onClose();
            }
        }

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [open, pending, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8">
            <div className="absolute inset-0" onClick={pending ? undefined : onClose} />
            <div className="relative z-10 w-full max-w-lg rounded-4xl border border-black/10 bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.2)] sm:p-7">
                <div className="flex items-start justify-between gap-4 border-b border-black/8 pb-5">
                    <div>
                        <h2 className="font-russo text-2xl tracking-[0.08em] text-black">
                            {mode === 'create' ? 'Agregar rol' : 'Editar rol'}
                        </h2>
                    </div>
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
                        <label htmlFor="role-name" className="text-sm font-semibold text-black">
                            Nombre
                        </label>
                        <input
                            id="role-name"
                            type="text"
                            value={form.name}
                            onChange={(event) => onChange('name', event.target.value)}
                            placeholder="Ej: Administracion"
                            required
                            className="rounded-2xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm text-black outline-none focus:border-[#e30613] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,6,19,0.08)]"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="role-salary" className="text-sm font-semibold text-black">
                            Salario por hora
                        </label>
                        <div className="flex items-center rounded-2xl border border-black/10 bg-[#fafaf8] px-4 py-3 focus-within:border-[#e30613] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(227,6,19,0.08)]">
                            <span className="mr-2 text-sm font-semibold text-black/55">$</span>
                            <input
                                id="role-salary"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.salaryHour}
                                onChange={(event) => onChange('salaryHour', event.target.value)}
                                placeholder="3500.00"
                                required
                                className="w-full bg-transparent text-sm text-black outline-none"
                            />
                        </div>
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

export default function RoleForm({ initialRoles, initialError }: RoleFormProps) {
    const [roles, setRoles] = useState(() => sortRoles(initialRoles));
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [selectedRole, setSelectedRole] = useState<Rol | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [feedback, setFeedback] = useState<string | null>(initialError ?? null);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();

    function openCreateModal() {
        setMode('create');
        setSelectedRole(null);
        setForm(emptyForm);
        setFeedback(null);
        setOpen(true);
    }

    function openEditModal(role: Rol) {
        setMode('edit');
        setSelectedRole(role);
        setForm({
            name: role.name,
            salaryHour: String(role.salaryHour),
        });
        setFeedback(null);
        setOpen(true);
    }

    function closeModal() {
        if (isPending) {
            return;
        }

        setOpen(false);
        setSelectedRole(null);
        setForm(emptyForm);
        setFeedback(initialError ?? null);
    }

    function handleFieldChange(field: keyof FormState, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function upsertRoleInState(role: Rol) {
        setRoles((current) => {
            const exists = current.some((item) => item.id === role.id);
            const next = exists
                ? current.map((item) => (item.id === role.id ? role : item))
                : [...current, role];

            return sortRoles(next);
        });
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFeedback(null);

        const salaryNumber = Number.parseFloat(form.salaryHour);
        const name = form.name.trim();

        if (!name) {
            setFeedback('Ingresa un nombre.');
            return;
        }

        if (Number.isNaN(salaryNumber) || salaryNumber <= 0) {
            setFeedback('Ingresa un salario valido.');
            return;
        }

        startTransition(async () => {
            const payload = { name, salaryHour: salaryNumber };
            const result =
                mode === 'create'
                    ? await crearRolAction(payload)
                    : selectedRole
                        ? await actualizarRolAction(selectedRole.id, payload)
                        : { success: false, error: 'No se encontro el rol a editar.' };

            if (!result.success) {
                setFeedback(result.error ?? 'No se pudo guardar el rol.');
                showToast({ type: 'error', title: 'No se pudo guardar el rol', description: result.error ?? 'Intenta nuevamente.' });
                return;
            }

            if (result.data) {
                upsertRoleInState(result.data);
            }

            setOpen(false);
            setSelectedRole(null);
            setForm(emptyForm);
            setFeedback(null);
            showToast({ type: 'success', title: mode === 'create' ? 'Rol cargado con exito' : 'Rol actualizado con exito' });
        });
    }

    function handleDelete(role: Rol) {
        const confirmed = window.confirm(`Se va a eliminar el rol "${role.name}".`);

        if (!confirmed) {
            return;
        }

        setFeedback(null);
        setPendingDeleteId(role.id);

        startTransition(async () => {
            const result = await eliminarRolAction(role.id);

            if (!result.success) {
                setFeedback(result.error ?? 'No se pudo eliminar el rol.');
                setPendingDeleteId(null);
                showToast({ type: 'error', title: 'No se pudo borrar el rol', description: result.error ?? 'Intenta nuevamente.' });
                return;
            }

            setRoles((current) => current.filter((item) => item.id !== role.id));
            setPendingDeleteId(null);
            showToast({ type: 'success', title: 'Rol borrado con exito' });
        });
    }

    return (
        <>
            <div className="rounded-4xl border border-black/8 bg-white shadow-[0_22px_48px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col gap-4 border-b border-black/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <path d="M7.5 6.5h9" />
                                <path d="M7.5 12h9" />
                                <path d="M7.5 17.5H13" />
                                <path d="M4.5 6.5h.01" />
                                <path d="M4.5 12h.01" />
                                <path d="M4.5 17.5h.01" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-black">Listado</p>
                            <p className="text-sm text-black/55">{roles.length} roles</p>
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
                                    <th className="px-6 py-4 font-semibold">Nombre</th>
                                    <th className="px-6 py-4 font-semibold">Salario por hora</th>
                                    <th className="px-6 py-4 text-right font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.length > 0 ? (
                                    roles.map((role) => (
                                        <tr key={role.id} className="border-b border-black/6 last:border-b-0">
                                            <td className="px-6 py-4 text-sm font-semibold text-black">{role.name}</td>
                                            <td className="px-6 py-4 text-sm text-black/68">{formatCurrency(role.salaryHour)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(role)}
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
                                                        onClick={() => handleDelete(role)}
                                                        disabled={isPending && pendingDeleteId === role.id}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-[#e30613]/16 px-3 py-2 text-sm font-semibold text-[#70000b] hover:bg-[#e30613] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                            <path d="M5 7h14" />
                                                            <path d="M9 7V5.5h6V7" />
                                                            <path d="M8 7l.7 11h6.6L16 7" />
                                                        </svg>
                                                        {isPending && pendingDeleteId === role.id ? 'Borrando...' : 'Borrar'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-10 text-center text-sm text-black/55">
                                            No hay roles cargados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid gap-3 p-4 md:hidden">
                    {roles.length > 0 ? (
                        roles.map((role) => (
                            <article key={role.id} className="rounded-3xl border border-black/8 bg-[#fafaf8] p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-base font-semibold text-black">{role.name}</h2>
                                        <p className="mt-1 text-sm text-black/60">{formatCurrency(role.salaryHour)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(role)}
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 text-black hover:bg-black hover:text-white"
                                            aria-label={`Editar ${role.name}`}
                                        >
                                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                <path d="m4 20 4.5-1 8.8-8.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20z" />
                                                <path d="M13 6.5 17.5 11" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(role)}
                                            disabled={isPending && pendingDeleteId === role.id}
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e30613]/16 text-[#70000b] hover:bg-[#e30613] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                            aria-label={`Borrar ${role.name}`}
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
                            No hay roles cargados.
                        </div>
                    )}
                </div>
            </div>

            <RoleModal
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
