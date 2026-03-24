"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
  leaving?: boolean;
}

interface ToastInput {
  title: string;
  description?: string;
  type?: ToastType;
}

interface ToastContextValue {
  showToast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, { wrapper: string; icon: string; progress: string }> = {
  success: {
    wrapper: "border-emerald-200/70 bg-white text-black",
    icon: "bg-emerald-500 text-white",
    progress: "bg-emerald-500",
  },
  error: {
    wrapper: "border-[#e30613]/25 bg-white text-black",
    icon: "bg-[#e30613] text-white",
    progress: "bg-[#e30613]",
  },
  info: {
    wrapper: "border-black/15 bg-white text-black",
    icon: "bg-black text-white",
    progress: "bg-black/70",
  },
};

const TOAST_DURATION_MS = 3200;
const TOAST_EXIT_MS = 220;

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <path d="M5 13l4 4L19 7" />
      </svg>
    );
  }

  if (type === "error") {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <path d="M6 6l12 12" />
        <path d="M18 6L6 18" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7h.01" />
    </svg>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) =>
      current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
    );

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_EXIT_MS);
  }, []);

  const showToast = useCallback((input: ToastInput) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const next: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      type: input.type ?? "info",
    };

    setToasts((current) => [...current.slice(-3), next]);

    window.setTimeout(() => {
      dismissToast(id);
    }, TOAST_DURATION_MS);
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "pointer-events-auto overflow-hidden rounded-2xl border shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-all duration-200",
              "backdrop-blur-sm",
              toastStyles[toast.type].wrapper,
              toast.leaving ? "translate-x-2 opacity-0" : "translate-x-0 opacity-100",
            ].join(" ")}
          >
            <div className="flex items-start gap-3 px-3 py-3">
              <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${toastStyles[toast.type].icon}`}>
                <ToastIcon type={toast.type} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-black/65">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-md p-1 text-black/45 transition-colors hover:bg-black/5 hover:text-black/70"
                aria-label="Cerrar alerta"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="h-1 w-full bg-black/5">
              <div
                className={`h-full ${toastStyles[toast.type].progress}`}
                style={{
                  animation: `toast-progress ${TOAST_DURATION_MS}ms linear forwards`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
}
