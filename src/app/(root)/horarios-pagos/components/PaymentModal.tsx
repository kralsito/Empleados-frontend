"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

interface PaymentModalProps {
  open: boolean;
  pendingTotal: number;
  onClose: () => void;
  onSubmit: (input: { date: string; amount: number; complete: boolean }) => Promise<void>;
}

type PaymentType = "COMPLETO" | "PARCIAL";

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

export function PaymentModal({ open, pendingTotal, onClose, onSubmit }: PaymentModalProps) {
  const [paymentType, setPaymentType] = useState<PaymentType>("COMPLETO");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getTodayISODate());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (open) {
      setPaymentType("COMPLETO");
      setAmount("");
      setError(null);
    }
  }, [open]);

  const currentAmount = useMemo(() => {
    if (paymentType === "COMPLETO") {
      return pendingTotal;
    }

    return Number(amount);
  }, [amount, paymentType, pendingTotal]);

  if (!open || !mounted) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!date) {
      setError("La fecha es obligatoria.");
      return;
    }

    if (pendingTotal <= 0) {
      setError("No hay montos pendientes para pagar.");
      return;
    }

    if (!Number.isFinite(currentAmount) || currentAmount <= 0) {
      setError("El monto debe ser mayor que cero.");
      return;
    }

    if (currentAmount > pendingTotal) {
      setError("El monto no puede exceder el total pendiente.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        date,
        amount: currentAmount,
        complete: paymentType === "COMPLETO",
      });

      setAmount("");
      setPaymentType("COMPLETO");
      setDate(getTodayISODate());
      onClose();
    } catch (submitError: unknown) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError("No se pudo aplicar el pago.");
      }
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl border border-black/15 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Aplicar pago</h3>
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
          <div className="rounded-xl border border-black/10 bg-black/5 p-3 text-sm">
            Total pendiente: <span className="font-semibold">{formatCurrency(pendingTotal)}</span>
          </div>

          <div className="grid gap-2">
            <label htmlFor="paymentDate" className="text-sm font-medium">Fecha</label>
            <input
              id="paymentDate"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-lg border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#e30613]"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Tipo de pago</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType("PARCIAL")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${paymentType === "PARCIAL" ? "bg-[#e30613] text-white" : "bg-black/5 text-black hover:bg-black/10"}`}
              >
                Parcial
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("COMPLETO")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${paymentType === "COMPLETO" ? "bg-[#e30613] text-white" : "bg-black/5 text-black hover:bg-black/10"}`}
              >
                Completo
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="paymentAmount" className="text-sm font-medium">Monto</label>
            <input
              id="paymentAmount"
              type="number"
              min={1}
              value={paymentType === "COMPLETO" ? pendingTotal : amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={paymentType === "COMPLETO"}
              className="rounded-lg border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#e30613] disabled:bg-black/5"
              placeholder="Ingresa monto"
            />
            {paymentType === "COMPLETO" && (
              <p className="text-xs text-black/60">En modo completo se paga automaticamente todo lo pendiente.</p>
            )}
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
              {saving ? "Guardando..." : "Confirmar pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
