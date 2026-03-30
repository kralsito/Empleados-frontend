"use client";

import { createPortal } from "react-dom";
import { WorklogDetail } from "@/lib/api/models/worklog/worklog";
import { StatusPill } from "./StatusPill";

interface WorklogDetailsModalProps {
  open: boolean;
  worklog: WorklogDetail | null;
  onClose: () => void;
}

function formatWorkedTime(hours: number) {
  const totalMinutes = Math.round(hours * 60);
  const fullHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${fullHours}h ${String(minutes).padStart(2, "0")}m`;
}

function getStatusPill(status: WorklogDetail["status"]) {
  if (status === "PAGADO") return <StatusPill label="Pagado" variant="paid" />;
  if (status === "PARCIAL") return <StatusPill label="Parcial" variant="partial" />;
  return <StatusPill label="Pendiente" variant="pending" />;
}

export function WorklogDetailsModal({ open, worklog, onClose }: WorklogDetailsModalProps) {
  if (!open || !worklog) {
    return null;
  }

  const modalContent = (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-2xl border border-black/15 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h4 className="text-lg font-semibold">Worklog cargado</h4>
            <p className="text-sm text-black/60">{worklog.date}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar vista"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-black/65 transition-colors hover:border-black/20 hover:bg-black/5 hover:text-black"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-black/10 bg-black/[0.02] p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-black/55">Estado</span>
            {getStatusPill(worklog.status)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-black/55">Horas</span>
            <span className="font-medium">{formatWorkedTime(worklog.hours)}</span>
          </div>
          <div>
            <p className="mb-1 text-black/55">Descripcion</p>
            <p className="font-medium text-black/80">{worklog.description || "Sin descripcion"}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

