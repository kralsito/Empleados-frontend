"use client";

import { useEffect, useState } from "react";
import { listEmployees, MockEmployee } from "@/lib/api/mocks/horariosPagosMock";
import { EmployeeSearchInput } from "./components/EmployeeSearchInput";
import { EmployeesTable } from "./components/EmployeesTable";

export default function HorariosPagosPage() {
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<MockEmployee[]>([]);

  useEffect(() => {
    const load = async () => {
      setEmployees(await listEmployees(query));
    };

    load();
  }, [query]);

  return (
    <section className="flex flex-col gap-6 text-black">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-russo text-3xl tracking-[0.08em] text-black">Horarios y Pagos</h1>
          <p className="text-sm text-black/60">Busqueda y seleccion de empleados para gestionar worklogs y pagos.</p>
        </div>
        <div className="hidden rounded-full border border-black/12 bg-white px-3 py-1.5 text-sm font-medium text-black/70 sm:inline-flex">
          Total de empleados: <span className="ml-1.5 font-semibold text-black">{employees.length}</span>
        </div>
      </div>

      <EmployeeSearchInput value={query} onChange={setQuery} />
      <EmployeesTable employees={employees} />
    </section>
  );
}
