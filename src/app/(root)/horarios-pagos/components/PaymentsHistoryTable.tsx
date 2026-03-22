"use client";

import { MockPayment } from "@/lib/api/mocks/horariosPagosMock";
import { StatusPill } from "./StatusPill";

interface PaymentsHistoryTableProps {
  payments: MockPayment[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PaymentsHistoryTable({ payments }: PaymentsHistoryTableProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-black/10 bg-white p-4 shadow-[0_16px_34px_rgba(0,0,0,0.08)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Historial de pagos</h2>
        <span className="rounded-full border border-black/10 bg-black/5 px-2.5 py-1 text-xs font-semibold text-black/65">
          {payments.length} registros
        </span>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-black/10 bg-black/[0.03] text-black/70">
          <tr>
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Tipo</th>
            <th className="px-3 py-2">Monto</th>
            <th className="px-3 py-2">Worklogs</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b border-black/10 align-top transition-colors hover:bg-[#fff5f6]">
              <td className="px-3 py-2">{payment.date}</td>
              <td className="px-3 py-2">
                <StatusPill
                  label={payment.type === "COMPLETO" ? "Completo" : "Parcial"}
                  variant={payment.type === "COMPLETO" ? "paid" : "partial"}
                />
              </td>
              <td className="px-3 py-2 font-semibold text-emerald-700">{formatCurrency(payment.amount)}</td>
              <td className="px-3 py-2">
                {payment.assignedWorklogs.map((assigned) => (
                  <div key={`${payment.id}-${assigned.worklogId}`} className="mb-1 last:mb-0">
                    <span className="font-semibold text-black/70">WL #{assigned.worklogId}</span>: {formatCurrency(assigned.paidAmount)}
                  </div>
                ))}
              </td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-sm text-black/60">Aun no hay pagos cargados para este empleado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
