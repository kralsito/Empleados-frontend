"use client";

import { FormEvent, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { WorklogDetail } from "@/lib/api/models/worklog/worklog";

type WorklogRow = WorklogDetail;

interface WorklogEditModalProps {
  open: boolean;
  salaryHour: number;
  worklog: WorklogRow | null;
  onClose: () => void;
  onSubmit: (input: { worklogId: number; hours: number; description: string }) => Promise<void>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function WorklogEditModal({ open, salaryHour, worklog, onClose, onSubmit }: WorklogEditModalProps) {
  const initialMinutes = worklog ? Math.round(worklog.hours * 60) : 480;
  const initialHoursPart = Math.floor(initialMinutes / 60);
  const initialMinutesPart = initialMinutes % 60;

  const [workedHours, setWorkedHours] = useState(String(initialHoursPart));
  const [workedMinutes, setWorkedMinutes] = useState(initialMinutesPart === 30 ? "30" : "00");
  const [description, setDescription] = useState(worklog?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const parsedHours = Number(workedHours) + Number(workedMinutes) / 60;
  const previewTotal = useMemo(() => {
    if (!Number.isFinite(parsedHours) || parsedHours <= 0) return 0;
    return Math.round(parsedHours * salaryHour);
  }, [parsedHours, salaryHour]);

  if (!open || !worklog) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (worklog.status !== "PENDIENTE") {
      setError("Solo se pueden editar worklogs pendientes.");
      return;
    }

    if (!Number.isFinite(parsedHours) || parsedHours < 0.5 || parsedHours > 24) {
      setError("Las horas deben estar entre 0.5 y 24.");
      return;
    }

    if (Number(workedHours) === 24 && workedMinutes !== "00") {
      setError("El maximo diario es 24h 00m.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({ worklogId: worklog.id, hours: parsedHours, description: description.trim() });
      onClose();
    } catch (submitError: unknown) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError("No se pudo editar el worklog.");
      }
      setSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-black/15 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h4 className="text-lg font-semibold">Editar worklog</h4>
            <p className="text-sm text-black/60">Fecha fija: {worklog.date}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-black/65 transition-colors hover:border-black/20 hover:bg-black/5 hover:text-black"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-black/10 bg-black/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black/55">Valor hora</p>
              <p className="mt-1 text-lg font-bold">{formatCurrency(salaryHour)}</p>
            </div>
            <div className="rounded-xl border border-[#e30613]/20 bg-[#fff5f6] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black/55">Total estimado</p>
              <p className="mt-1 text-lg font-bold text-[#e30613]">{formatCurrency(previewTotal)}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Horas trabajadas</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={workedHours}
                onChange={(event) => setWorkedHours(event.target.value)}
                className="rounded-lg border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#e30613]"
              >
                {Array.from({ length: 25 }).map((_, index) => (
                  <option key={index} value={String(index)}>
                    {index} horas
                  </option>
                ))}
              </select>
              <select
                value={workedMinutes}
                onChange={(event) => setWorkedMinutes(event.target.value)}
                className="rounded-lg border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#e30613]"
              >
                <option value="00">00 minutos</option>
                <option value="30" disabled={workedHours === "24"}>30 minutos</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="editWorklogDescription" className="text-sm font-medium">Descripcion</label>
            <textarea
              id="editWorklogDescription"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-24 rounded-lg border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#e30613]"
              maxLength={180}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-[#e30613]/20 bg-[#e30613]/8 px-3 py-2 text-sm text-[#a3040e]">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-black/20 px-3 py-2 text-sm hover:bg-black/5">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#e30613] px-3 py-2 text-sm font-semibold text-white hover:bg-[#c70511] disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

