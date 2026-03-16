'use client';

import { useEffect, useState, useTransition } from 'react';
import {
    actualizarEmpleadoAction,
    crearEmpleadoAction,
    eliminarEmpleadoAction,
} from '@/actions/empleados';
import { Empleado, NuevoEmpleadoInput } from '@/lib/api/models/employee/employee';
import { Rol } from '@/lib/api/models/role/role';

type EmployeFormProps = {
    initialEmployees: Empleado[];
    roles: Rol[];
    initialError?: string;
};

type FormState = {
    name: string;
    lastName: string;
    roleId: string;
};

const emptyForm: FormState = {
    name: '',
    lastName: '',
    roleId: '',
};

function sortEmployees(items: Empleado[]) {
    return [...items].sort((a, b) => {
        const byLastName = a.lastName.localeCompare(b.lastName, 'es', { sensitivity: 'base' });

        if (byLastName !== 0) {
            return byLastName;
        }

        return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
    });
}

function EmployeModal({
    open,
    mode,
    form,
    error,
    pending,
    roles,
    onClose,
    onChange,
    onSubmit,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    form: FormState;
    error: string | null;
    pending: boolean;
    roles: Rol[];
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
            <div className="relative z-10 w-full max-w-xl rounded-4xl border border-black/10 bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.2)] sm:p-7">
                <div className="flex items-start justify-between gap-4 border-b border-black/8 pb-5">
                    <h2 className="font-russo text-2xl tracking-[0.08em] text-black">
                        {mode === 'create' ? 'Agregar empleado' : 'Editar empleado'}
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
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="employee-name" className="text-sm font-semibold text-black">
                                Nombre
                            </label>
                            <input
                                id="employee-name"
                                type="text"
                                value={form.name}
                                onChange={(event) => onChange('name', event.target.value)}
                                placeholder="Ej: Juan"
                                required
                                className="rounded-2xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm text-black outline-none focus:border-[#e30613] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,6,19,0.08)]"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="employee-lastname" className="text-sm font-semibold text-black">
                                Apellido
                            </label>
                            <input
                                id="employee-lastname"
                                type="text"
                                value={form.lastName}
                                onChange={(event) => onChange('lastName', event.target.value)}
                                placeholder="Ej: Perez"
                                required
                                className="rounded-2xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm text-black outline-none focus:border-[#e30613] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,6,19,0.08)]"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="employee-role" className="text-sm font-semibold text-black">
                            Rol
                        </label>
                        <select
                            id="employee-role"
                            value={form.roleId}
                            onChange={(event) => onChange('roleId', event.target.value)}
                            required
                            className="rounded-2xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm text-black outline-none focus:border-[#e30613] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,6,19,0.08)]"
                        >
                            <option value="">Seleccionar rol</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
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

export default function EmployeForm({ initialEmployees, roles, initialError }: EmployeFormProps) {
    const [employees, setEmployees] = useState(() => sortEmployees(initialEmployees));
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [selectedEmployee, setSelectedEmployee] = useState<Empleado | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [feedback, setFeedback] = useState<string | null>(initialError ?? null);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();

    function openCreateModal() {
        setMode('create');
        setSelectedEmployee(null);
        setForm(emptyForm);
        setFeedback(null);
        setOpen(true);
    }

    function openEditModal(employee: Empleado) {
        setMode('edit');
        setSelectedEmployee(employee);
        setForm({
            name: employee.name,
            lastName: employee.lastName,
            roleId: String(employee.role.id),
        });
        setFeedback(null);
        setOpen(true);
    }

    function closeModal() {
        if (isPending) {
            return;
        }

        setOpen(false);
        setSelectedEmployee(null);
        setForm(emptyForm);
        setFeedback(initialError ?? null);
    }

    function handleFieldChange(field: keyof FormState, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function upsertEmployeeInState(employee: Empleado) {
        setEmployees((current) => {
            const exists = current.some((item) => item.id === employee.id);
            const next = exists
                ? current.map((item) => (item.id === employee.id ? employee : item))
                : [...current, employee];

            return sortEmployees(next);
        });
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFeedback(null);

        const name = form.name.trim();
        const lastName = form.lastName.trim();
        const roleId = Number.parseInt(form.roleId, 10);

        if (!name) {
            setFeedback('Ingresa un nombre.');
            return;
        }

        if (!lastName) {
            setFeedback('Ingresa un apellido.');
            return;
        }

        if (Number.isNaN(roleId)) {
            setFeedback('Selecciona un rol.');
            return;
        }

        startTransition(async () => {
            const payload: NuevoEmpleadoInput = { name, lastName, roleId };
            const result =
                mode === 'create'
                    ? await crearEmpleadoAction(payload)
                    : selectedEmployee
                        ? await actualizarEmpleadoAction(selectedEmployee.id, payload)
                        : { success: false, error: 'No se encontro el empleado a editar.' };

            if (!result.success) {
                setFeedback(result.error ?? 'No se pudo guardar el empleado.');
                return;
            }

            if (result.data) {
                upsertEmployeeInState(result.data);
            }

            setOpen(false);
            setSelectedEmployee(null);
            setForm(emptyForm);
            setFeedback(null);
        });
    }

    function handleDelete(employee: Empleado) {
        const confirmed = window.confirm(`Se va a eliminar el empleado "${employee.name} ${employee.lastName}".`);

        if (!confirmed) {
            return;
        }

        setFeedback(null);
        setPendingDeleteId(employee.id);

        startTransition(async () => {
            const result = await eliminarEmpleadoAction(employee.id);

            if (!result.success) {
                setFeedback(result.error ?? 'No se pudo eliminar el empleado.');
                setPendingDeleteId(null);
                return;
            }

            setEmployees((current) => current.filter((item) => item.id !== employee.id));
            setPendingDeleteId(null);
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
                                <path d="M5 19h14" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-black">Listado</p>
                            <p className="text-sm text-black/55">{employees.length} empleados</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        disabled={roles.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e30613] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(227,6,19,0.24)] hover:bg-[#c70511] disabled:cursor-not-allowed disabled:opacity-60"
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

                {roles.length === 0 ? (
                    <div className="border-b border-black/8 px-5 py-4 text-sm text-black/60 sm:px-6">
                        Para crear empleados primero necesitas roles cargados.
                    </div>
                ) : null}

                <div className="hidden md:block">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="border-b border-black/8 text-xs uppercase tracking-[0.16em] text-black/45">
                                    <th className="px-6 py-4 font-semibold">Nombre</th>
                                    <th className="px-6 py-4 font-semibold">Apellido</th>
                                    <th className="px-6 py-4 font-semibold">Rol</th>
                                    <th className="px-6 py-4 text-right font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length > 0 ? (
                                    employees.map((employee) => (
                                        <tr key={employee.id} className="border-b border-black/6 last:border-b-0">
                                            <td className="px-6 py-4 text-sm font-semibold text-black">{employee.name}</td>
                                            <td className="px-6 py-4 text-sm text-black/68">{employee.lastName}</td>
                                            <td className="px-6 py-4 text-sm text-black/68">{employee.role.name}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(employee)}
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
                                                        onClick={() => handleDelete(employee)}
                                                        disabled={isPending && pendingDeleteId === employee.id}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-[#e30613]/16 px-3 py-2 text-sm font-semibold text-[#70000b] hover:bg-[#e30613] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                            <path d="M5 7h14" />
                                                            <path d="M9 7V5.5h6V7" />
                                                            <path d="M8 7l.7 11h6.6L16 7" />
                                                        </svg>
                                                        {isPending && pendingDeleteId === employee.id ? 'Borrando...' : 'Borrar'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-sm text-black/55">
                                            No hay empleados cargados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid gap-3 p-4 md:hidden">
                    {employees.length > 0 ? (
                        employees.map((employee) => (
                            <article key={employee.id} className="rounded-3xl border border-black/8 bg-[#fafaf8] p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-base font-semibold text-black">
                                            {employee.name} {employee.lastName}
                                        </h2>
                                        <p className="mt-1 text-sm text-black/60">{employee.role.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(employee)}
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 text-black hover:bg-black hover:text-white"
                                            aria-label={`Editar ${employee.name} ${employee.lastName}`}
                                        >
                                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                <path d="m4 20 4.5-1 8.8-8.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20z" />
                                                <path d="M13 6.5 17.5 11" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(employee)}
                                            disabled={isPending && pendingDeleteId === employee.id}
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e30613]/16 text-[#70000b] hover:bg-[#e30613] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                            aria-label={`Borrar ${employee.name} ${employee.lastName}`}
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
                            No hay empleados cargados.
                        </div>
                    )}
                </div>
            </div>

            <EmployeModal
                open={open}
                mode={mode}
                form={form}
                error={feedback}
                pending={isPending}
                roles={roles}
                onClose={closeModal}
                onChange={handleFieldChange}
                onSubmit={handleSubmit}
            />
        </>
    );
}
