"use client";

import Link from "next/link";
import { MockEmployee } from "@/lib/api/mocks/horariosPagosMock";
import { StatusPill } from "./StatusPill";

interface EmployeesTableProps {
  employees: MockEmployee[];
}

export function EmployeesTable({ employees }: EmployeesTableProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-black/10 bg-white p-4 shadow-[0_16px_34px_rgba(0,0,0,0.08)]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-black/10 bg-black/[0.03] text-black/70">
          <tr>
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">Empleado</th>
            <th className="px-3 py-2">Rol</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-b border-black/10 transition-colors hover:bg-[#fff5f6]">
              <td className="px-3 py-2 font-semibold text-black/75">#{employee.id}</td>
              <td className="px-3 py-2 font-medium">{employee.name} {employee.lastName}</td>
              <td className="px-3 py-2 text-black/70">{employee.role}</td>
              <td className="px-3 py-2">
                <StatusPill label="Activo" variant="paid" />
              </td>
              <td className="px-3 py-2">
                <Link
                  href={`/horarios-pagos/${employee.id}`}
                  className="inline-flex items-center rounded-lg border border-[#e30613]/30 bg-[#e30613] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(227,6,19,0.25)] transition-colors hover:bg-[#c70511]"
                >
                  Ver horarios y pagos
                </Link>
              </td>
            </tr>
          ))}
          {employees.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-sm text-black/60">No se encontraron empleados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
