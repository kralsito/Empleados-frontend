"use client";

import { WorklogDetail, WorklogStatus } from "@/lib/api/models/worklog/worklog";
import { StatusPill } from "./StatusPill";

type WorklogRow = WorklogDetail;

interface WorklogsTableProps {
  rows: WorklogRow[];
  emptyLabel: string;
  onEditWorklog?: (worklog: WorklogRow) => void;
  onDeleteWorklog?: (worklog: WorklogRow) => void;
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

export function WorklogsTable({ rows, emptyLabel, onEditWorklog, onDeleteWorklog }: WorklogsTableProps) {
  const getStatusPill = (status: WorklogStatus) => {
    if (status === "PAGADO") {
      return <StatusPill label="Pagado" variant="paid" />;
    }

    if (status === "PARCIAL") {
      return <StatusPill label="Parcial" variant="partial" />;
    }

    return <StatusPill label="Pendiente" variant="pending" />;
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-black/10 bg-white p-4 shadow-[0_16px_34px_rgba(0,0,0,0.08)]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-black/10 bg-black/[0.03] text-black/70">
          <tr>
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Descripcion</th>
            <th className="px-3 py-2">Horas</th>
            <th className="px-3 py-2">Monto</th>
            <th className="px-3 py-2">Pagado</th>
            <th className="px-3 py-2">Restante</th>
            <th className="px-3 py-2">Estado</th>
            {(onEditWorklog || onDeleteWorklog) && <th className="px-3 py-2">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((worklog) => (
            <tr key={worklog.id} className="border-b border-black/10 transition-colors hover:bg-[#fff5f6]">
              <td className="px-3 py-2">{worklog.date}</td>
              <td className="px-3 py-2 font-medium">{worklog.description || "Sin descripcion"}</td>
              <td className="px-3 py-2 text-black/70">{formatWorkedTime(worklog.hours)}</td>
              <td className="px-3 py-2 font-semibold text-black/75">{formatCurrency(worklog.amount)}</td>
              <td className="px-3 py-2 text-emerald-700">{formatCurrency(worklog.paidAmount)}</td>
              <td className="px-3 py-2 font-semibold text-[#e30613]">{formatCurrency(worklog.remaining)}</td>
              <td className="px-3 py-2">{getStatusPill(worklog.status)}</td>
              {(onEditWorklog || onDeleteWorklog) && (
                <td className="px-3 py-2">
                  {worklog.status === "PENDIENTE" ? (
                    <div className="flex items-center gap-1.5">
                      {onEditWorklog && (
                        <button
                          type="button"
                          title="Editar"
                          onClick={() => onEditWorklog(worklog)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/20 text-black/70 hover:bg-black/5 hover:text-black"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                          </svg>
                        </button>
                      )}
                      {onDeleteWorklog && (
                        <button
                          type="button"
                          title="Borrar"
                          onClick={() => onDeleteWorklog(worklog)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e30613]/25 text-[#c70511] hover:bg-[#fff1f2]"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-black/45">Bloqueado</span>
                  )}
                </td>
              )}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={(onEditWorklog || onDeleteWorklog) ? 8 : 7} className="p-4 text-center text-sm text-black/60">{emptyLabel}</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
