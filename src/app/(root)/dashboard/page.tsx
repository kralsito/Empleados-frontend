import Link from 'next/link';

const shortcuts = [
    {
        href: '/configuracion/roles',
        title: 'Roles',
        action: 'Administrar',
        icon: (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M7.5 6.5h9" />
                <path d="M7.5 12h9" />
                <path d="M7.5 17.5H13" />
                <path d="M4.5 6.5h.01" />
                <path d="M4.5 12h.01" />
                <path d="M4.5 17.5h.01" />
            </svg>
        ),
    },
    {
        href: '/configuracion/empleados',
        title: 'Empleados',
        action: 'Configurar',
        icon: (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M16 19a4 4 0 0 0-8 0" />
                <circle cx="12" cy="10" r="3.2" />
                <path d="M5 19h14" />
            </svg>
        ),
    },
    {
        href: '/horas',
        title: 'Horas',
        action: 'Cargar',
        icon: (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 8v4.5l3 2" />
            </svg>
        ),
    },
];

export default function DashboardPage() {
    return (
        <section className="flex flex-col gap-6">
            <div className="rounded-[2rem] border border-black/8 bg-[linear-gradient(145deg,#0b0b0b,#1a1a1a)] p-6 text-white shadow-[0_30px_60px_rgba(0,0,0,0.18)] sm:p-8">
                <h1 className="font-russo text-3xl tracking-[0.08em] text-white sm:text-4xl">Dashboard</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {shortcuts.map((shortcut) => (
                    <Link
                        key={shortcut.href}
                        href={shortcut.href}
                        className="rounded-[1.75rem] border border-black/8 bg-white p-5 shadow-[0_18px_36px_rgba(0,0,0,0.05)] hover:-translate-y-0.5"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4f4f2] text-black">
                            {shortcut.icon}
                        </div>
                        <h2 className="mt-4 text-lg font-semibold text-black">{shortcut.title}</h2>
                        <p className="mt-1 text-sm text-black/58">{shortcut.action}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
