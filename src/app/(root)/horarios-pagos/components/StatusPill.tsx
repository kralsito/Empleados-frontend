"use client";

type PillVariant = "pending" | "partial" | "paid" | "info";

interface StatusPillProps {
  label: string;
  variant: PillVariant;
}

const variantClasses: Record<PillVariant, string> = {
  pending: "border-amber-300 bg-amber-50 text-amber-700",
  partial: "border-sky-300 bg-sky-50 text-sky-700",
  paid: "border-emerald-300 bg-emerald-50 text-emerald-700",
  info: "border-black/15 bg-black/5 text-black/75",
};

export function StatusPill({ label, variant }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${variantClasses[variant]}`}>
      {label}
    </span>
  );
}
