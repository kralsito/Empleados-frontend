"use client";

interface WorklogTabsProps {
  activeTab: "pending" | "paid";
  onTabChange: (tab: "pending" | "paid") => void;
  pendingCount: number;
  paidCount: number;
}

export function WorklogTabs({ activeTab, onTabChange, pendingCount, paidCount }: WorklogTabsProps) {
  const tabBase = "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors";

  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white p-2 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
      <button
        type="button"
        onClick={() => onTabChange("pending")}
        className={`${tabBase} ${activeTab === "pending" ? "bg-[#e30613] text-white" : "bg-black/5 text-black hover:bg-black/10"}`}
      >
        Pendientes
        <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === "pending" ? "bg-white/20 text-white" : "bg-black/10 text-black/70"}`}>
          {pendingCount}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onTabChange("paid")}
        className={`${tabBase} ${activeTab === "paid" ? "bg-[#e30613] text-white" : "bg-black/5 text-black hover:bg-black/10"}`}
      >
        Pagados
        <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === "paid" ? "bg-white/20 text-white" : "bg-black/10 text-black/70"}`}>
          {paidCount}
        </span>
      </button>
    </div>
  );
}
