'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import {
    actualizarEmpleadoAction,
    crearEmpleadoAction,
    eliminarEmpleadoAction,
} from '@/actions/empleados';
import { crearRolAction } from '@/actions/roles';
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

type RoleQuickFormState = {
    name: string;
    salaryHour: string;
};

const emptyRoleForm: RoleQuickFormState = {
    name: '',
    salaryHour: '',
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

function sortRoles(items: Rol[]) {
    return [...items].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
}

function getSelectedRoleLabel(roleId: string, roles: Rol[]) {
    if (!roleId) {
        return 'Seleccionar rol';
    }

    return roles.find((role) => String(role.id) === roleId)?.name ?? 'Seleccionar rol';
}

function QuickRoleModal({
    open,
    form,
    error,
    pending,
    onClose,
    onChange,
    onSubmit,
}: {
    open: boolean;
    form: RoleQuickFormState;
    error: string | null;
    pending: boolean;
    onClose: () => void;
    onChange: (field: keyof RoleQuickFormState, value: string) => void;
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4 py-8">
            <div className="absolute inset-0" onClick={pending ? undefined : onClose} />
            <div className="relative z-10 w-full max-w-lg rounded-4xl border border-black/10 bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.24)] sm:p-7">
                <div className="flex items-start justify-between gap-4 border-b border-black/8 pb-5">
                    <h2 className="font-russo text-2xl tracking-[0.08em] text-black">Crear rol</h2>
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
                        <label htmlFor="quick-role-name" className="text-sm font-semibold text-black">
                            Nombre
                        </label>
                        <input
                            id="quick-role-name"
                            type="text"
                            value={form.name}
                            onChange={(event) => onChange('name', event.target.value)}
                            placeholder="Nombre del rol"
                            required
                            className="rounded-2xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm text-black outline-none focus:border-[#e30613] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,6,19,0.08)]"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="quick-role-salary" className="text-sm font-semibold text-black">
                            Salario por hora
                        </label>
                        <div className="flex items-center rounded-2xl border border-black/10 bg-[#fafaf8] px-4 py-3 focus-within:border-[#e30613] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(227,6,19,0.08)]">
                            <span className="mr-2 text-sm font-semibold text-black/55">$</span>
                            <input
                                id="quick-role-salary"
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
                            {pending ? 'Creando...' : 'Guardar rol'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function EmployeModal({
    open,
    mode,
    form,
    error,
    pending,
    roles,
    roleDropdownOpen,
    roleCreatorPending,
    onClose,
    onChange,
    onRoleSelect,
    onRoleDropdownToggle,
    onRoleDropdownClose,
    onRoleCreatorToggle,
    onSubmit,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    form: FormState;
    error: string | null;
    pending: boolean;
    roles: Rol[];
    roleDropdownOpen: boolean;
    roleCreatorPending: boolean;
    onClose: () => void;
    onChange: (field: keyof FormState, value: string) => void;
    onRoleSelect: (roleId: string) => void;
    onRoleDropdownToggle: () => void;
    onRoleDropdownClose: () => void;
    onRoleCreatorToggle: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
    const roleDropdownRef = useRef<HTMLDivElement | null>(null);

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

    useEffect(() => {
        if (!roleDropdownOpen) {
            return;
        }

        function handlePointerDown(event: MouseEvent) {
            if (!roleDropdownRef.current?.contains(event.target as Node)) {
                onRoleDropdownClose();
            }
        }

        window.addEventListener('mousedown', handlePointerDown);
        return () => window.removeEventListener('mousedown', handlePointerDown);
    }, [roleDropdownOpen, onRoleDropdownClose]);

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
                        <label htmlFor="employee-role-trigger" className="text-sm font-semibold text-black">
                            Rol
                        </label>
                        <div ref={roleDropdownRef} className="relative">
                            <button
                                id="employee-role-trigger"
                                type="button"
                                onClick={onRoleDropdownToggle}
                                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm outline-none ${
                                    roleDropdownOpen
                                        ? 'border-[#e30613] bg-white shadow-[0_0_0_4px_rgba(227,6,19,0.08)]'
                                        : 'border-black/10 bg-[#fafaf8]'
                                }`}
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                            <path d="M7.5 6.5h9" />
                                            <path d="M7.5 12h9" />
                                            <path d="M7.5 17.5H13" />
                                            <path d="M4.5 6.5h.01" />
                                            <path d="M4.5 12h.01" />
                                            <path d="M4.5 17.5h.01" />
                                        </svg>
                                    </span>
                                    <div className="min-w-0">
                                        <p className={`truncate font-semibold ${form.roleId ? 'text-black' : 'text-black/50'}`}>
                                            {getSelectedRoleLabel(form.roleId, roles)}
                                        </p>
                                        <p className="text-xs text-black/45">Selecciona o crea un rol</p>
                                    </div>
                                </div>
                                <svg
                                    viewBox="0 0 20 20"
                                    className={`h-4 w-4 shrink-0 text-black/55 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M5.2 7.5 10 12.3l4.8-4.8" />
                                </svg>
                            </button>

                            {roleDropdownOpen ? (
                                <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-20 overflow-hidden rounded-3xl border border-black/10 bg-[#121212] text-white shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
                                    <div className="max-h-64 overflow-y-auto p-2">
                                        {roles.length > 0 ? (
                                            roles.map((role) => {
                                                const selected = String(role.id) === form.roleId;

                                                return (
                                                    <button
                                                        key={role.id}
                                                        type="button"
                                                        onClick={() => onRoleSelect(String(role.id))}
                                                        className={`flex w-full items-start justify-between rounded-2xl px-3 py-3 text-left ${
                                                            selected
                                                                ? 'bg-[#e30613] text-white'
                                                                : 'text-white/82 hover:bg-white/8'
                                                        }`}
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold">{role.name}</p>
                                                            <p className={`mt-1 text-xs ${selected ? 'text-white/78' : 'text-white/45'}`}>
                                                                ${Number(role.salaryHour).toFixed(2)} por hora
                                                            </p>
                                                        </div>
                                                        {selected ? (
                                                            <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                                <path d="M4.5 10 8 13.5 15.5 6.5" />
                                                            </svg>
                                                        ) : null}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="px-3 py-6 text-center text-sm text-white/55">
                                                No hay roles cargados.
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-white/8 bg-[#151515] p-2">
                                        <button
                                            type="button"
                                            onClick={onRoleCreatorToggle}
                                            disabled={roleCreatorPending}
                                            className="flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-white hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <span className="text-base leading-none">+</span>
                                            Crear nuevo rol
                                        </button>
                                    </div>
                                </div>
                            ) : null}
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

export default function EmployeForm({ initialEmployees, roles, initialError }: EmployeFormProps) {
    const [employees, setEmployees] = useState(() => sortEmployees(initialEmployees));
    const [availableRoles, setAvailableRoles] = useState(() => sortRoles(roles));
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [selectedEmployee, setSelectedEmployee] = useState<Empleado | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
    const [roleCreatorOpen, setRoleCreatorOpen] = useState(false);
    const [roleCreatorForm, setRoleCreatorForm] = useState<RoleQuickFormState>(emptyRoleForm);
    const [roleCreatorError, setRoleCreatorError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(initialError ?? null);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isRoleCreatorPending, startRoleCreatorTransition] = useTransition();

    function openCreateModal() {
        setMode('create');
        setSelectedEmployee(null);
        setForm(emptyForm);
        setRoleDropdownOpen(false);
        setRoleCreatorOpen(false);
        setRoleCreatorForm(emptyRoleForm);
        setRoleCreatorError(null);
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
        setRoleDropdownOpen(false);
        setRoleCreatorOpen(false);
        setRoleCreatorForm(emptyRoleForm);
        setRoleCreatorError(null);
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
        setRoleDropdownOpen(false);
        setRoleCreatorOpen(false);
        setRoleCreatorForm(emptyRoleForm);
        setRoleCreatorError(null);
        setFeedback(initialError ?? null);
    }

    function handleFieldChange(field: keyof FormState, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function handleRoleSelect(roleId: string) {
        setForm((current) => ({ ...current, roleId }));
        setRoleDropdownOpen(false);
    }

    function handleRoleCreatorFieldChange(field: keyof RoleQuickFormState, value: string) {
        setRoleCreatorForm((current) => ({ ...current, [field]: value }));
    }

    function toggleRoleCreator() {
        if (isRoleCreatorPending) {
            return;
        }

        setRoleCreatorOpen((current) => !current);
        setRoleDropdownOpen(false);
        setRoleCreatorError(null);

        if (roleCreatorOpen) {
            setRoleCreatorForm(emptyRoleForm);
        }
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

    function handleQuickRoleCreate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setRoleCreatorError(null);

        const name = roleCreatorForm.name.trim();
        const salaryHour = Number.parseFloat(roleCreatorForm.salaryHour);

        if (!name) {
            setRoleCreatorError('Ingresa un nombre para el rol.');
            return;
        }

        if (Number.isNaN(salaryHour) || salaryHour <= 0) {
            setRoleCreatorError('Ingresa un salario valido para el rol.');
            return;
        }

        startRoleCreatorTransition(async () => {
            const result = await crearRolAction({ name, salaryHour });

            if (!result.success || !result.data) {
                setRoleCreatorError(result.error ?? 'No se pudo crear el rol.');
                return;
            }

            setAvailableRoles((current) => sortRoles([...current, result.data!]));
            setForm((current) => ({ ...current, roleId: String(result.data!.id) }));
            setRoleDropdownOpen(false);
            setRoleCreatorOpen(false);
            setRoleCreatorForm(emptyRoleForm);
            setRoleCreatorError(null);
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

                {availableRoles.length === 0 ? (
                    <div className="border-b border-black/8 px-5 py-4 text-sm text-black/60 sm:px-6">
                        No hay roles cargados. Puedes crear uno desde el modal de empleado.
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
                roles={availableRoles}
                roleDropdownOpen={roleDropdownOpen}
                roleCreatorPending={isRoleCreatorPending}
                onClose={closeModal}
                onChange={handleFieldChange}
                onRoleSelect={handleRoleSelect}
                onRoleDropdownToggle={() => setRoleDropdownOpen((current) => !current)}
                onRoleDropdownClose={() => setRoleDropdownOpen(false)}
                onRoleCreatorToggle={toggleRoleCreator}
                onSubmit={handleSubmit}
            />
            <QuickRoleModal
                open={roleCreatorOpen}
                form={roleCreatorForm}
                error={roleCreatorError}
                pending={isRoleCreatorPending}
                onClose={toggleRoleCreator}
                onChange={handleRoleCreatorFieldChange}
                onSubmit={handleQuickRoleCreate}
            />
        </>
    );
}
