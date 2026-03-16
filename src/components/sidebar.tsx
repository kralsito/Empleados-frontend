"use client"; // Obligatorio para poder usar 'useState' y hacer el botón clickeable

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function SidebarIcon({
    children,
    active = false,
}: {
    children: React.ReactNode;
    active?: boolean;
}) {
    return (
        <span className={`flex h-9 w-9 items-center justify-center rounded-2xl border ${active ? 'border-white/20 bg-white/12 text-white' : 'border-white/10 bg-white/5 text-white/72'}`}>
            {children}
        </span>
    );
}

export default function Sidebar() {
    // Esta es "la memoria" de nuestro componente. Arranca en falso (cerrado).
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const pathname = usePathname();

    const configOpen = isConfigOpen || pathname.startsWith('/configuracion');
    const isDashboard = pathname === '/dashboard';
    const isEmployees = pathname === '/configuracion/empleados';
    const isRoles = pathname === '/configuracion/roles';
    const isConfigSelected = isEmployees || isRoles;

    const linkBase = 'group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold';
    const linkState = 'border-white/8 bg-white/4 text-white/80 hover:border-white/14 hover:bg-white/8 hover:text-white';
    const linkActive = 'border-[#e30613]/40 bg-[#e30613] text-white shadow-[0_16px_34px_rgba(227,6,19,0.28)]';

    return (
        <aside className="w-full border-b border-black/8 bg-black px-4 py-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:border-r-white/8 lg:px-5 lg:py-6">
            <div className="flex h-full flex-col gap-6">
                <div className="flex items-center gap-3 rounded-[1.75rem] border border-white/10 bg-white/5 px-4 py-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e30613] shadow-[0_18px_34px_rgba(227,6,19,0.35)]">
                        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M5 17.5V7.8A1.8 1.8 0 0 1 6.8 6h10.4A1.8 1.8 0 0 1 19 7.8v9.7" />
                            <path d="M3 19h18" />
                            <path d="M8 10.5h8" />
                            <path d="M8 14h5" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-russo text-lg tracking-[0.18em] text-white">TECNOKRAL</p>
                        <p className="text-xs uppercase tracking-[0.28em] text-white/56">Gestion Empleados</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2">
                <Link
                    href="/dashboard"
                    className={`${linkBase} ${isDashboard ? linkActive : linkState}`}
                >
                    <SidebarIcon active={isDashboard}>
                        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M4.5 12.5h6V19h-6zM13.5 5h6v14h-6zM4.5 5h6v4h-6z" />
                        </svg>
                    </SidebarIcon>
                    <div className="flex flex-col">
                        <span>Dashboard</span>
                        <span className="text-xs font-medium opacity-65">Resumen operativo</span>
                    </div>
                </Link>

                <Link
                    href="/horas"
                    className={`${linkBase} ${linkState}`}
                >
                    <SidebarIcon>
                        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <circle cx="12" cy="12" r="8.5" />
                            <path d="M12 8v4.5l3 2" />
                        </svg>
                    </SidebarIcon>
                    <div className="flex flex-col">
                        <span>Cargar horas</span>
                        <span className="text-xs font-medium opacity-65">Registro diario</span>
                    </div>
                </Link>

                <div className="flex flex-col w-full">
                    <button
                        onClick={() => setIsConfigOpen(!configOpen)}
                        className={`${linkBase} ${isConfigSelected ? linkActive : linkState} justify-between`}
                    >
                        <div className="flex items-center gap-2">
                            <SidebarIcon active={isConfigSelected}>
                                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                    <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z" />
                                    <path d="M19.4 13.5a7.9 7.9 0 0 0 .06-1.5l1.6-1.23-1.8-3.11-1.96.53a8.6 8.6 0 0 0-1.28-.75L15.4 4h-3.6l-.62 2.44a8.6 8.6 0 0 0-1.28.75l-1.96-.53-1.8 3.11L7.74 12a7.9 7.9 0 0 0 .06 1.5l-1.6 1.23 1.8 3.11 1.96-.53c.4.3.83.55 1.28.75L11.8 20h3.6l.62-2.44c.45-.2.88-.45 1.28-.75l1.96.53 1.8-3.11z" />
                                </svg>
                            </SidebarIcon>
                            <div className="flex flex-col text-left">
                                <span>Configuración</span>
                                <span className="text-xs font-medium opacity-65">Estructura interna</span>
                            </div>
                        </div>
                        <span className={`transform transition-transform ${configOpen ? 'rotate-180' : ''}`}>
                            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                                <path d="M5.2 7.5 10 12.3l4.8-4.8" />
                            </svg>
                        </span>
                    </button>

                    {configOpen && (
                        <div className="mt-2 flex flex-col gap-2 rounded-3xl border border-white/8 bg-white/4 p-3">
                            <Link
                                href="/configuracion/empleados"
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isEmployees ? 'bg-white text-black' : 'text-white/70 hover:bg-white/8 hover:text-white'}`}
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                    <path d="M16 19a4 4 0 0 0-8 0" />
                                    <circle cx="12" cy="10" r="3.2" />
                                    <path d="M5 19h14" />
                                </svg>
                                Empleados
                            </Link>

                            <Link
                                href="/configuracion/roles"
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isRoles ? 'bg-white text-black' : 'text-white/70 hover:bg-white/8 hover:text-white'}`}
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                    <path d="M7.5 6.5h9" />
                                    <path d="M7.5 12h9" />
                                    <path d="M7.5 17.5H13" />
                                    <path d="M4.5 6.5h.01" />
                                    <path d="M4.5 12h.01" />
                                    <path d="M4.5 17.5h.01" />
                                </svg>
                                Roles
                            </Link>
                        </div>
                    )}
                </div>
                </nav>
            </div>
        </aside>
    );
}
