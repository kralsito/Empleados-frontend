"use client";

interface EmployeeSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function EmployeeSearchInput({ value, onChange }: EmployeeSearchInputProps) {
  return (
    <section className="mb-5">
      <div className="flex flex-col gap-2 md:max-w-xl">
        <label htmlFor="employeeSearch" className="text-xs font-semibold uppercase tracking-[0.08em] text-black/55">
          Buscar empleado
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-black/15 bg-white px-3 py-2 shadow-[0_8px_20px_rgba(0,0,0,0.05)] focus-within:border-[#e30613]/45">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-black/45" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.2-3.2" />
          </svg>
          <input
            id="employeeSearch"
            className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Nombre o apellido..."
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-md px-2 py-1 text-xs font-semibold text-black/60 hover:bg-black/5 hover:text-black"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
