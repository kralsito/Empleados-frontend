"use client";

import { useEffect, useMemo, useState } from "react";
import { listarEmpleadosHorariosAction } from "@/actions/horarios-pagos";
import { Empleado } from "@/lib/api/models/employee/employee";
import { EmployeeSearchInput } from "./components/EmployeeSearchInput";
import { EmployeesTable } from "./components/EmployeesTable";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function HorariosPagosPage() {
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      setError(null);

      const result = await listarEmpleadosHorariosAction();
      if (!result.success || !result.data) {
        setEmployees([]);
        setError(result.error ?? "No se pudieron cargar los empleados.");
        setLoading(false);
        return;
      }

      setEmployees(result.data);
      setLoading(false);
    };

    void loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return employees;

    return employees.filter((employee) => {
      const fullName = normalizeText(`${employee.name} ${employee.lastName}`);
      return fullName.includes(normalizedQuery);
    });
  }, [employees, query]);

  return (
    <section className="flex flex-col gap-6 text-black">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-russo text-3xl tracking-[0.08em] text-black">Horarios y Pagos</h1>
          <p className="text-sm text-black/60">Busqueda y seleccion de empleados para gestionar worklogs y pagos.</p>
        </div>
        <div className="hidden rounded-full border border-black/12 bg-white px-3 py-1.5 text-sm font-medium text-black/70 sm:inline-flex">
          Total de empleados: <span className="ml-1.5 font-semibold text-black">{filteredEmployees.length}</span>
        </div>
      </div>

      <EmployeeSearchInput value={query} onChange={setQuery} />

      {loading ? (
        <section className="rounded-3xl border border-black/10 bg-white p-6 text-sm text-black/70">
          Cargando empleados...
        </section>
      ) : error ? (
        <section className="rounded-3xl border border-[#e30613]/20 bg-[#fff5f6] p-6 text-sm text-[#70000b]">
          {error}
        </section>
      ) : (
        <EmployeesTable employees={filteredEmployees} />
      )}
    </section>
  );
}

