"use client";

import { FormEvent, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { HandleStatus, MockWorklog } from "@/lib/api/mocks/horariosPagosMock";
import { StatusPill } from "./StatusPill";

type WorklogRow = MockWorklog & { status: HandleStatus; remaining: number };

interface WorklogCreateModalProps {
  open: boolean;
  employeeName: string;
  roleName: string;
  salaryHour: number;
  existingWorklogs: WorklogRow[];
  onClose: () => void;
  onSubmit: (input: { date: string; hours: number; description: string }) => Promise<void>;
  onRequestEdit?: (worklog: WorklogRow) => void;
  onRequestDelete?: (worklog: WorklogRow) => void;
}

const WEEK_DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function getTodayISODate() {
  return new Date().toISOString().slice(0, 10);
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

function toIsoDate(year: number, month: number, day: number) {
  const base = new Date(year, month, day);
  const safeYear = base.getFullYear();
  const safeMonth = String(base.getMonth() + 1).padStart(2, "0");
  const safeDay = String(base.getDate()).padStart(2, "0");
  return `${safeYear}-${safeMonth}-${safeDay}`;
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return {
    year,
    monthIndex: month - 1,
    day,
  };
}

function getMonthName(year: number, monthIndex: number) {
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(new Date(year, monthIndex, 1));
}

export function WorklogCreateModal({
  open,
  employeeName,
  roleName,
  salaryHour,
  existingWorklogs,
  onClose,
  onSubmit,
  onRequestEdit,
  onRequestDelete,
}: WorklogCreateModalProps) {
  const today = getTodayISODate();
  const initialDate = parseIsoDate(today);

  const [viewYear, setViewYear] = useState(initialDate.year);
  const [viewMonth, setViewMonth] = useState(initialDate.monthIndex);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewWorklog, setViewWorklog] = useState<WorklogRow | null>(null);
  const [workedHours, setWorkedHours] = useState("8");
  const [workedMinutes, setWorkedMinutes] = useState("00");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [menuDate, setMenuDate] = useState<string | null>(null);

  const parsedHours = Number(workedHours) + Number(workedMinutes) / 60;
  const previewTotal = useMemo(() => {
    if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
      return 0;
    }
    return Math.round(parsedHours * salaryHour);
  }, [parsedHours, salaryHour]);

  const worklogMap = useMemo(() => {
    const map = new Map<string, WorklogRow>();
    for (const worklog of existingWorklogs) {
      map.set(worklog.date, worklog);
    }
    return map;
  }, [existingWorklogs]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const firstWeekday = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { isoDate: string; day: number; inMonth: boolean; worklog?: WorklogRow }[] = [];

    for (let i = firstWeekday - 1; i >= 0; i -= 1) {
      const day = prevMonthDays - i;
      const isoDate = toIsoDate(viewYear, viewMonth - 1, day);
      cells.push({ isoDate, day, inMonth: false, worklog: worklogMap.get(isoDate) });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const isoDate = toIsoDate(viewYear, viewMonth, day);
      cells.push({ isoDate, day, inMonth: true, worklog: worklogMap.get(isoDate) });
    }

    while (cells.length % 7 !== 0) {
      const day = cells.length - (firstWeekday + daysInMonth) + 1;
      const isoDate = toIsoDate(viewYear, viewMonth + 1, day);
      cells.push({ isoDate, day, inMonth: false, worklog: worklogMap.get(isoDate) });
    }

    return cells;
  }, [viewYear, viewMonth, worklogMap]);

  const getStatusPill = (status: HandleStatus) => {
    if (status === "PAGADO") return <StatusPill label="Pagado" variant="paid" />;
    if (status === "PARCIAL") return <StatusPill label="Parcial" variant="partial" />;
    return <StatusPill label="Pendiente" variant="pending" />;
  };

  if (!open) {
    return null;
  }

  const changeMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const openFormForDate = (isoDate: string) => {
    setSelectedDate(isoDate);
    setWorkedHours("8");
    setWorkedMinutes("00");
    setDescription("");
    setError(null);
    setSaving(false);
    setMenuDate(null);
  };

  const closeForm = () => {
    setSelectedDate(null);
    setError(null);
    setSaving(false);
    setMenuDate(null);
  };

  const openViewForWorklog = (worklog: WorklogRow) => {
    setViewWorklog(worklog);
    setMenuDate(null);
  };

  const closeViewWorklog = () => {
    setViewWorklog(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!selectedDate) {
      setError("Primero selecciona un dia.");
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

    if (!description.trim()) {
      setError("La descripcion es obligatoria.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({ date: selectedDate, hours: parsedHours, description: description.trim() });
      onClose();
    } catch (submitError: unknown) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError("No se pudo guardar el worklog.");
      }
      setSaving(false);
    }
  };

  const selectedDayWorklog = selectedDate ? worklogMap.get(selectedDate) : undefined;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-4 backdrop-blur-[2px]">
      <section className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-black/15 bg-white p-4 shadow-[0_24px_60px_rgba(0,0,0,0.25)] sm:p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">Calendario de worklogs</h3>
            <p className="text-sm text-black/60">{employeeName} - {roleName}</p>
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

        <div className="mb-3 flex items-center justify-between gap-2">
          <button type="button" onClick={() => changeMonth(-1)} className="rounded-lg border border-black/10 px-2 py-1 text-sm hover:bg-black/5" aria-label="Mes anterior">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <p className="text-sm font-semibold capitalize">{getMonthName(viewYear, viewMonth)}</p>
          <button type="button" onClick={() => changeMonth(1)} className="rounded-lg border border-black/10 px-2 py-1 text-sm hover:bg-black/5" aria-label="Mes siguiente">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>

        <div className="overflow-y-auto pr-1">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="px-1 py-1 text-center text-xs font-semibold uppercase tracking-[0.06em] text-black/45">{day}</div>
          ))}

          {calendarCells.map((cell) => {
            const hasWorklog = Boolean(cell.worklog);
            const isToday = cell.isoDate === today;
            const canManage = hasWorklog && cell.worklog?.status === "PENDIENTE";
            const menuOpen = menuDate === cell.isoDate;

            return (
              <div
                key={cell.isoDate}
                onClick={() => {
                  if (cell.worklog) {
                    openViewForWorklog(cell.worklog);
                    return;
                  }
                  openFormForDate(cell.isoDate);
                }}
                className={[
                  "relative min-h-20 cursor-pointer rounded-xl border p-2 text-left transition-colors sm:min-h-24",
                  "border-black/10 bg-white hover:border-black/20 hover:bg-black/[0.03]",
                  !cell.inMonth ? "opacity-45" : "opacity-100",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className={`text-sm font-semibold ${isToday ? "text-[#e30613]" : "text-black/75"}`}>
                    {cell.day}
                  </span>
                  <div className="flex items-center gap-1">
                    {hasWorklog && <span className="mt-0.5 h-2 w-2 rounded-full bg-[#e30613]" aria-hidden="true" />}
                    {hasWorklog && (
                      <button
                        type="button"
                        title="Opciones"
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuDate(menuOpen ? null : cell.isoDate);
                        }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-black/10 text-black/60 hover:bg-black/5"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                          <circle cx="12" cy="5" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="12" cy="19" r="1.8" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {hasWorklog ? (
                  <div className="mt-2 space-y-1">
                    <p className="line-clamp-1 text-xs font-medium text-black/70">{cell.worklog?.description}</p>
                    <p className="text-[11px] text-black/55">{formatWorkedTime(cell.worklog?.hours ?? 0)}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] text-black/35">Click para cargar</p>
                )}
                {menuOpen && hasWorklog && (
                  <div
                    onClick={(event) => event.stopPropagation()}
                    className="absolute right-2 top-8 z-10 w-36 rounded-lg border border-black/12 bg-white p-1 shadow-[0_10px_24px_rgba(0,0,0,0.15)]"
                  >
                    <button
                      type="button"
                      disabled={!canManage || !onRequestEdit}
                      onClick={() => {
                        if (canManage && onRequestEdit && cell.worklog) {
                          onRequestEdit(cell.worklog);
                        }
                        setMenuDate(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-black/5 disabled:text-black/35"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      type="button"
                      disabled={!canManage || !onRequestDelete}
                      onClick={() => {
                        if (canManage && onRequestDelete && cell.worklog) {
                          onRequestDelete(cell.worklog);
                        }
                        setMenuDate(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-[#c70511] hover:bg-[#fff1f2] disabled:text-[#c70511]/40"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                      Borrar
                    </button>
                    {!canManage && (
                      <p className="px-2 py-1 text-[10px] text-black/45">Solo disponible en pendientes</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-dashed border-black/20 bg-white px-3 py-2 text-xs text-black/60">
          Click en un dia para abrir el modal de carga. Punto rojo = dia con worklog cargado.
        </div>

        {viewWorklog && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
            <div className="w-full max-w-md rounded-2xl border border-black/15 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold">Worklog cargado</h4>
                  <p className="text-sm text-black/60">{viewWorklog.date}</p>
                </div>
                <button
                  type="button"
                  onClick={closeViewWorklog}
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
                  {getStatusPill(viewWorklog.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black/55">Horas</span>
                  <span className="font-medium">{formatWorkedTime(viewWorklog.hours)}</span>
                </div>
                <div>
                  <p className="mb-1 text-black/55">Descripcion</p>
                  <p className="font-medium text-black/80">{viewWorklog.description}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button type="button" onClick={closeViewWorklog} className="rounded-lg border border-black/20 px-3 py-2 text-sm hover:bg-black/5">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedDate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-black/15 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold">Nuevo worklog</h4>
                  <p className="text-sm text-black/60">Dia seleccionado: {selectedDate}</p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  aria-label="Cerrar formulario"
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

                {selectedDayWorklog && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">
                    <div className="mb-1">{getStatusPill(selectedDayWorklog.status)}</div>
                    <p className="text-amber-800">Este dia ya tiene carga: {selectedDayWorklog.description}</p>
                  </div>
                )}

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
                  <label htmlFor="worklogDescription" className="text-sm font-medium">Descripcion</label>
                  <textarea
                    id="worklogDescription"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="min-h-24 rounded-lg border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#e30613]"
                    placeholder="Ej: control de inventario, soporte, atencion al cliente..."
                  />
                </div>

                {error && (
                  <p className="rounded-lg border border-[#e30613]/20 bg-[#e30613]/8 px-3 py-2 text-sm text-[#a3040e]">{error}</p>
                )}

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={closeForm} className="rounded-lg border border-black/20 px-3 py-2 text-sm hover:bg-black/5">
                    Volver al calendario
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#e30613] px-3 py-2 text-sm font-semibold text-white hover:bg-[#c70511] disabled:opacity-60"
                  >
                    {saving ? "Guardando..." : "Guardar worklog"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );

  return createPortal(modalContent, document.body);
}

