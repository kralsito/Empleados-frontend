"use client";

import { createPortal } from "react-dom";
import { HandleStatus, MockWorklog } from "@/lib/api/mocks/horariosPagosMock";

type WorklogRow = MockWorklog & { status: HandleStatus; remaining: number };

interface WorklogDeleteModalProps {
  open: boolean;
  worklog: WorklogRow | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function formatWorkedTime(hours: number) {
  const totalMinutes = Math.round(hours * 60);
  const fullHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${fullHours}h ${String(minutes).padStart(2, "0")}m`;
}

export function WorklogDeleteModal({ open, worklog, loading = false, onClose, onConfirm }: WorklogDeleteModalProps) {
  if (!open || !worklog) {
    return null;
  }

  const handleConfirm = async () => {
    await onConfirm();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-2xl border border-black/15 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
        <h4 className="text-lg font-semibold">Confirmar eliminacion</h4>
        <p className="mt-2 text-sm text-black/65">Vas a borrar este worklog. Esta accion no se puede deshacer.</p>

        <div className="mt-4 rounded-xl border border-black/10 bg-black/[0.03] p-3 text-sm">
          <p className="font-semibold">{worklog.date}</p>
          <p className="text-black/70">{worklog.description}</p>
          <p className="mt-1 text-black/60">{formatWorkedTime(worklog.hours)}</p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-black/20 px-3 py-2 text-sm hover:bg-black/5">
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="rounded-lg bg-[#e30613] px-3 py-2 text-sm font-semibold text-white hover:bg-[#c70511] disabled:opacity-60"
          >
            {loading ? "Borrando..." : "Borrar worklog"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
