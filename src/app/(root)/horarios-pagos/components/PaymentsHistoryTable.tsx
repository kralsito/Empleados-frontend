"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { PaymentDetail } from "@/lib/api/models/payment/payment";
import { WorklogDetail } from "@/lib/api/models/worklog/worklog";
import { StatusPill } from "./StatusPill";

interface PaymentsHistoryTableProps {
  payments: PaymentDetail[];
  worklogs: WorklogDetail[];
  fromDate: string;
  toDate: string;
  loading?: boolean;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onApplyFilter: () => void;
  onClearFilter: () => void;
  onOpenWorklog?: (worklogId: number) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatWorkedTime(hours: number) {
  const totalMinutes = Math.round(hours * 60);
  const fullHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${fullHours}h ${String(minutes).padStart(2, "0")}m`;
}

function getPaymentMethodLabel(value: PaymentDetail["paymentMethod"]) {
  if (value === "EFECTIVO") return "Efectivo";
  if (value === "TRANSFERENCIA") return "Transferencia";
  if (value === "COMBINADO") return "Combinado";
  return "Sin metodo";
}

function PaymentDetailsModal({
  payment,
  worklogs,
  onClose,
  onOpenWorklog,
}: {
  payment: PaymentDetail;
  worklogs: WorklogDetail[];
  onClose: () => void;
  onOpenWorklog?: (worklogId: number) => void;
}) {
  const worklogsById = useMemo(() => {
    const map = new Map<number, WorklogDetail>();
    for (const worklog of worklogs) {
      map.set(worklog.id, worklog);
    }
    return map;
  }, [worklogs]);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-black/15 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h4 className="text-lg font-semibold">Detalle de pago</h4>
            <p className="text-sm text-black/60">Pago #{payment.id} - {payment.date}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-black/65 transition-colors hover:border-black/20 hover:bg-black/5 hover:text-black"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-black/10 bg-black/5 p-3">
            <p className="text-xs uppercase tracking-[0.08em] text-black/50">Monto</p>
            <p className="mt-1 font-semibold text-emerald-700">{formatCurrency(payment.amount)}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-black/5 p-3">
            <p className="text-xs uppercase tracking-[0.08em] text-black/50">Horas</p>
            <p className="mt-1 font-semibold">{formatWorkedTime(payment.totalWorkedHours ?? 0)}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-black/5 p-3">
            <p className="text-xs uppercase tracking-[0.08em] text-black/50">Metodo</p>
            <p className="mt-1 font-semibold">{getPaymentMethodLabel(payment.paymentMethod)}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-black/10">
          <div className="border-b border-black/10 bg-black/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-black/55">
            Worklogs incluidos
          </div>
          <div className="max-h-64 overflow-y-auto">
            {payment.assignedWorklogs.length > 0 ? (
              payment.assignedWorklogs.map((allocation) => {
                const worklog = worklogsById.get(allocation.worklogId);
                return (
                  <div key={`${payment.id}-${allocation.worklogId}`} className="flex items-center justify-between border-b border-black/8 px-3 py-2 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-black/80">{allocation.description || worklog?.description || "Sin descripcion"}</p>
                      <p className="text-xs text-black/55">
                        {allocation.date || worklog?.date} · {formatWorkedTime(allocation.hours ?? worklog?.hours ?? 0)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-emerald-700">{formatCurrency(allocation.paidAmount)}</span>
                      {onOpenWorklog && (
                        <button
                          type="button"
                          onClick={() => onOpenWorklog(allocation.worklogId)}
                          className="rounded-md border border-black/15 px-2 py-1 text-xs font-semibold hover:bg-black/5"
                        >
                          Ver worklog
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="px-3 py-4 text-sm text-black/60">Este pago no tiene worklogs asignados.</p>
            )}
          </div>
        </div>

        {payment.paymentProof && (
          <div className="mt-4 rounded-xl border border-black/10 bg-black/[0.02] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-black/50">Comprobante</p>
            <a
              href={payment.paymentProof}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex w-full items-center justify-between rounded-lg border border-black/10 bg-white p-2 text-left hover:bg-black/[0.02]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-md border border-black/10 bg-black/5 text-xs font-semibold text-black/60">
                  PDF
                </div>
                <div>
                  <p className="text-sm font-semibold text-black/75">Comprobante PDF</p>
                  <p className="text-xs text-black/55">Abrir en nueva pestaña</p>
                </div>
              </div>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-black/50 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function PaymentsHistoryTable({
  payments,
  worklogs,
  fromDate,
  toDate,
  loading = false,
  onFromDateChange,
  onToDateChange,
  onApplyFilter,
  onClearFilter,
  onOpenWorklog,
}: PaymentsHistoryTableProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(null);
  const [dateOrder, setDateOrder] = useState<"desc" | "asc">("desc");

  const sortedPayments = useMemo(() => {
    const factor = dateOrder === "desc" ? -1 : 1;

    return [...payments].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare * factor;

      const paidAtA = a.paidAt ? new Date(a.paidAt).getTime() : 0;
      const paidAtB = b.paidAt ? new Date(b.paidAt).getTime() : 0;
      if (paidAtA !== paidAtB) return (paidAtA - paidAtB) * factor;

      return (a.id - b.id) * factor;
    });
  }, [payments, dateOrder]);

  return (
    <section className="overflow-hidden rounded-3xl border border-black/10 bg-white p-4 shadow-[0_16px_34px_rgba(0,0,0,0.08)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Historial de pagos</h2>
        <span className="rounded-full border border-black/10 bg-black/5 px-2.5 py-1 text-xs font-semibold text-black/65">
          {payments.length} registros
        </span>
      </div>

      <div className="mb-4 grid gap-2 rounded-xl border border-black/10 bg-black/[0.02] p-3 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input
          type="date"
          value={fromDate}
          onChange={(event) => onFromDateChange(event.target.value)}
          className="rounded-lg border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#e30613]"
        />
        <input
          type="date"
          value={toDate}
          onChange={(event) => onToDateChange(event.target.value)}
          className="rounded-lg border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#e30613]"
        />
        <button
          type="button"
          onClick={onApplyFilter}
          disabled={loading}
          className="rounded-lg bg-[#e30613] px-3 py-2 text-sm font-semibold text-white hover:bg-[#c70511] disabled:opacity-60"
        >
          {loading ? "Buscando..." : "Filtrar"}
        </button>
        <button
          type="button"
          onClick={onClearFilter}
          disabled={loading}
          className="rounded-lg border border-black/20 px-3 py-2 text-sm font-semibold hover:bg-black/5 disabled:opacity-60"
        >
          Limpiar
        </button>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="border-b border-black/10 bg-black/[0.03] text-black/70">
          <tr>
            <th className="px-3 py-2">
              <button
                type="button"
                onClick={() => setDateOrder((current) => (current === "desc" ? "asc" : "desc"))}
                className="inline-flex items-center gap-1.5 font-semibold hover:text-black"
              >
                Fecha
                <svg
                  viewBox="0 0 20 20"
                  className={`h-3.5 w-3.5 transition-transform ${dateOrder === "asc" ? "rotate-180" : ""}`}
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="m5.5 7.5 4.5 5 4.5-5" />
                </svg>
              </button>
            </th>
            <th className="px-3 py-2">Tipo</th>
            <th className="px-3 py-2">Metodo</th>
            <th className="px-3 py-2">Horas</th>
            <th className="px-3 py-2">Monto</th>
            <th className="px-3 py-2">Comprobante</th>
            <th className="px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedPayments.map((payment) => (
            <tr key={payment.id} className="border-b border-black/10 align-top transition-colors hover:bg-[#fff5f6]">
              <td className="px-3 py-2">{payment.date}</td>
              <td className="px-3 py-2">
                <StatusPill
                  label={payment.type === "COMPLETO" ? "Completo" : "Parcial"}
                  variant={payment.type === "COMPLETO" ? "paid" : "partial"}
                />
              </td>
              <td className="px-3 py-2">{getPaymentMethodLabel(payment.paymentMethod)}</td>
              <td className="px-3 py-2">{formatWorkedTime(payment.totalWorkedHours ?? 0)}</td>
              <td className="px-3 py-2 font-semibold text-emerald-700">{formatCurrency(payment.amount)}</td>
              <td className="px-3 py-2">
                {payment.paymentProof ? (
                  <a
                    href={payment.paymentProof}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#e30613] hover:underline"
                  >
                    Ver archivo
                  </a>
                ) : (
                  <span className="text-xs text-black/45">Sin adjunto</span>
                )}
              </td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayment(payment)}
                  className="rounded-md border border-black/15 px-2.5 py-1 text-xs font-semibold hover:bg-black/5"
                >
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
          {sortedPayments.length === 0 && (
            <tr>
              <td colSpan={7} className="p-4 text-center text-sm text-black/60">Aun no hay pagos cargados para este empleado.</td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          worklogs={worklogs}
          onClose={() => setSelectedPayment(null)}
          onOpenWorklog={(worklogId) => {
            onOpenWorklog?.(worklogId);
          }}
        />
      )}
    </section>
  );
}
