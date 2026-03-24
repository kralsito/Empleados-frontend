"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  actualizarWorklogAction,
  aplicarPagoAction,
  buscarPagosEmpleadoAction,
  crearWorklogAction,
  eliminarWorklogAction,
  obtenerEmpleadoHorariosAction,
} from "@/actions/horarios-pagos";
import { Empleado } from "@/lib/api/models/employee/employee";
import { PaymentDetail } from "@/lib/api/models/payment/payment";
import { WorklogDetail } from "@/lib/api/models/worklog/worklog";
import { useToast } from "@/components/ui/toast-provider";
import { PaymentModal } from "../components/PaymentModal";
import { PaymentsHistoryTable } from "../components/PaymentsHistoryTable";
import { WorklogCreateModal } from "../components/WorklogCreateModal";
import { WorklogDeleteModal } from "../components/WorklogDeleteModal";
import { WorklogDetailsModal } from "../components/WorklogDetailsModal";
import { WorklogEditModal } from "../components/WorklogEditModal";
import { WorklogsTable } from "../components/WorklogsTable";
import { WorklogTabs } from "../components/WorklogTabs";

type WorklogRow = WorklogDetail;

export default function EmployeeHorariosPage() {
  const params = useParams<{ employeeId: string }>();
  const employeeId = Number(params.employeeId);

  const [employee, setEmployee] = useState<Empleado | null>(null);
  const [worklogs, setWorklogs] = useState<WorklogRow[]>([]);
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [tab, setTab] = useState<"pending" | "paid">("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [worklogModalOpen, setWorklogModalOpen] = useState(false);
  const [worklogModalKey, setWorklogModalKey] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedWorklog, setSelectedWorklog] = useState<WorklogRow | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingWorklog, setDeletingWorklog] = useState<WorklogRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewWorklogModalOpen, setViewWorklogModalOpen] = useState(false);
  const [viewingWorklog, setViewingWorklog] = useState<WorklogRow | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    if (!Number.isFinite(employeeId)) {
      setError("El ID de empleado no es valido.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await obtenerEmpleadoHorariosAction(employeeId);
    if (!result.success || !result.data) {
      setEmployee(null);
      setWorklogs([]);
      setPayments([]);
      setError(result.error ?? "No se pudieron cargar los datos del empleado.");
      setLoading(false);
      return;
    }

    setEmployee(result.data.employee);
    setWorklogs(result.data.worklogs);
    setPayments(result.data.payments);

    if (!result.data.employee) {
      setError("No se encontro el empleado solicitado.");
    }

    setLoading(false);
  }, [employeeId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const shouldLockScroll = modalOpen || worklogModalOpen || editModalOpen || deleteModalOpen || viewWorklogModalOpen;
    if (!shouldLockScroll) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalOpen, worklogModalOpen, editModalOpen, deleteModalOpen, viewWorklogModalOpen]);

  const pendingWorklogs = useMemo(() => worklogs.filter((worklog) => worklog.status !== "PAGADO"), [worklogs]);
  const paidWorklogs = useMemo(() => worklogs.filter((worklog) => worklog.status === "PAGADO"), [worklogs]);
  const pendingTotal = useMemo(
    () => pendingWorklogs.reduce((acc, worklog) => acc + worklog.remaining, 0),
    [pendingWorklogs],
  );
  const totalBilled = useMemo(() => worklogs.reduce((acc, worklog) => acc + worklog.amount, 0), [worklogs]);
  const totalPaid = useMemo(() => worklogs.reduce((acc, worklog) => acc + worklog.paidAmount, 0), [worklogs]);

  const handleApplyPayment = async (input: {
    date: string;
    amount: number;
    complete: boolean;
    paymentMethod: "EFECTIVO" | "TRANSFERENCIA" | "COMBINADO";
    paymentProof: string | null;
  }) => {
    const result = await aplicarPagoAction({
      employeeId,
      date: input.date,
      amount: input.amount,
      complete: input.complete,
      paymentMethod: input.paymentMethod,
      paymentProof: input.paymentProof,
    });

    if (!result.success) {
      showToast({ type: "error", title: "No se pudo aplicar el pago", description: result.error ?? "Intenta nuevamente." });
      throw new Error(result.error ?? "No se pudo aplicar el pago.");
    }

    showToast({ type: "success", title: "Pago aplicado con exito" });
    await loadData();
  };

  const handleFilterPayments = async () => {
    if ((fromDate && !toDate) || (!fromDate && toDate)) {
      setError("Para filtrar por periodo debes completar ambas fechas.");
      showToast({ type: "error", title: "Filtro incompleto", description: "Completa ambas fechas para filtrar." });
      return;
    }

    if (fromDate && toDate && fromDate > toDate) {
      setError("La fecha desde no puede ser mayor a la fecha hasta.");
      showToast({ type: "error", title: "Rango invalido", description: "Revisa las fechas del filtro." });
      return;
    }

    setPaymentsLoading(true);
    setError(null);

    const result = await buscarPagosEmpleadoAction(employeeId, fromDate && toDate ? { from: fromDate, to: toDate } : undefined);
    if (!result.success || !result.data) {
      setPaymentsLoading(false);
      setError(result.error ?? "No se pudo filtrar el historial de pagos.");
      showToast({ type: "error", title: "No se pudo filtrar pagos", description: result.error ?? "Intenta nuevamente." });
      return;
    }

    setPayments(result.data);
    showToast({ type: "info", title: "Filtro aplicado", description: `${result.data.length} pagos encontrados.` });
    setPaymentsLoading(false);
  };

  const handleClearPaymentsFilter = async () => {
    setFromDate("");
    setToDate("");
    setPaymentsLoading(true);
    setError(null);

    const result = await buscarPagosEmpleadoAction(employeeId);
    if (!result.success || !result.data) {
      setPaymentsLoading(false);
      setError(result.error ?? "No se pudo recargar el historial de pagos.");
      showToast({ type: "error", title: "No se pudo recargar pagos", description: result.error ?? "Intenta nuevamente." });
      return;
    }

    setPayments(result.data);
    showToast({ type: "info", title: "Filtro limpiado" });
    setPaymentsLoading(false);
  };

  const handleCreateWorklog = async (input: { date: string; hours: number; description: string }) => {
    const result = await crearWorklogAction({
      employeeId,
      date: input.date,
      description: input.description,
      hoursWorked: input.hours,
    });

    if (!result.success) {
      showToast({ type: "error", title: "No se pudo crear el worklog", description: result.error ?? "Intenta nuevamente." });
      throw new Error(result.error ?? "No se pudo crear el worklog.");
    }

    setTab("pending");
    showToast({ type: "success", title: "Worklog cargado con exito" });
    await loadData();
  };

  const handleUpdateWorklog = async (input: { worklogId: number; hours: number; description: string }) => {
    const worklogToUpdate = worklogs.find((worklog) => worklog.id === input.worklogId);
    if (!worklogToUpdate) {
      throw new Error("No se encontro el worklog a editar.");
    }

    const result = await actualizarWorklogAction(input.worklogId, {
      employeeId,
      date: worklogToUpdate.date,
      description: input.description,
      hoursWorked: input.hours,
    });

    if (!result.success) {
      showToast({ type: "error", title: "No se pudo editar el worklog", description: result.error ?? "Intenta nuevamente." });
      throw new Error(result.error ?? "No se pudo actualizar el worklog.");
    }

    showToast({ type: "success", title: "Worklog actualizado con exito" });
    await loadData();
  };

  const handleOpenEdit = (worklog: WorklogRow) => {
    setSelectedWorklog(worklog);
    setEditModalOpen(true);
  };

  const handleOpenDelete = (worklog: WorklogRow) => {
    setDeletingWorklog(worklog);
    setDeleteModalOpen(true);
  };

  const handleDeleteWorklog = async () => {
    if (!deletingWorklog) return;

    setDeleting(true);
    try {
      const result = await eliminarWorklogAction(deletingWorklog.id, employeeId);
      if (!result.success) {
        showToast({ type: "error", title: "No se pudo borrar el worklog", description: result.error ?? "Intenta nuevamente." });
        throw new Error(result.error ?? "No se pudo eliminar el worklog.");
      }

      setDeleteModalOpen(false);
      setDeletingWorklog(null);
      showToast({ type: "success", title: "Worklog borrado con exito" });
      await loadData();
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <main className="p-6 text-black">Cargando datos del empleado...</main>;
  }

  if (error || !employee) {
    return (
      <main className="p-6 text-black">
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <h1 className="mb-2 font-russo text-2xl tracking-[0.08em]">Horarios y Pagos</h1>
          <p className="mb-4 text-sm text-black/70">{error ?? "No se encontro el empleado solicitado."}</p>
          <Link href="/horarios-pagos" className="rounded-lg bg-[#e30613] px-3 py-2 text-sm font-semibold text-white hover:bg-[#c70511]">
            Volver al listado
          </Link>
        </div>
      </main>
    );
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <main className="space-y-5 p-6 text-black">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/horarios-pagos" className="text-sm font-semibold text-[#e30613] hover:underline">
            Volver al listado
          </Link>
          <h1 className="font-russo text-3xl tracking-[0.08em] text-black">{employee.name} {employee.lastName}</h1>
          <p className="text-sm text-black/60">Rol: {employee.role.name}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setWorklogModalKey((current) => current + 1);
              setWorklogModalOpen(true);
            }}
            className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black hover:border-black/30 hover:bg-black/5"
          >
            Cargar worklog
          </button>
          <button
            type="button"
            disabled={pendingTotal <= 0}
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-[#e30613] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c70511] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Aplicar pago {pendingTotal > 0 ? `(${formatCurrency(pendingTotal)} pendiente)` : ""}
          </button>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black/50">Worklogs</p>
          <p className="mt-1 text-2xl font-bold">{worklogs.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-700">Pendiente</p>
          <p className="mt-1 text-2xl font-bold text-amber-800">{formatCurrency(pendingTotal)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Pagado</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black/50">Facturado total</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(totalBilled)}</p>
        </div>
      </section>

      <WorklogTabs
        activeTab={tab}
        onTabChange={setTab}
        pendingCount={pendingWorklogs.length}
        paidCount={paidWorklogs.length}
      />

      {tab === "pending" ? (
        <WorklogsTable
          rows={pendingWorklogs}
          emptyLabel="No hay worklogs pendientes para este empleado."
          onEditWorklog={handleOpenEdit}
          onDeleteWorklog={handleOpenDelete}
        />
      ) : (
        <WorklogsTable rows={paidWorklogs} emptyLabel="No hay worklogs pagados para este empleado." />
      )}

      <PaymentsHistoryTable
        payments={payments}
        worklogs={worklogs}
        fromDate={fromDate}
        toDate={toDate}
        loading={paymentsLoading}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onApplyFilter={handleFilterPayments}
        onClearFilter={handleClearPaymentsFilter}
        onOpenWorklog={(worklogId) => {
          const target = worklogs.find((worklog) => worklog.id === worklogId);
          if (!target) return;

          setViewingWorklog(target);
          setViewWorklogModalOpen(true);
        }}
      />

      <PaymentModal
        open={modalOpen}
        pendingTotal={pendingTotal}
        onClose={() => setModalOpen(false)}
        onSubmit={handleApplyPayment}
      />
      <WorklogCreateModal
        key={worklogModalKey}
        open={worklogModalOpen}
        employeeName={`${employee.name} ${employee.lastName}`}
        roleName={employee.role.name}
        salaryHour={Number(employee.role.salaryHour)}
        existingWorklogs={worklogs}
        onClose={() => setWorklogModalOpen(false)}
        onSubmit={handleCreateWorklog}
        onRequestEdit={(worklog) => {
          handleOpenEdit(worklog);
        }}
        onRequestDelete={(worklog) => {
          handleOpenDelete(worklog);
        }}
      />
      <WorklogEditModal
        key={`${selectedWorklog?.id ?? "none"}-${editModalOpen ? "open" : "closed"}`}
        open={editModalOpen}
        salaryHour={Number(employee.role.salaryHour)}
        worklog={selectedWorklog}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedWorklog(null);
        }}
        onSubmit={handleUpdateWorklog}
      />
      <WorklogDeleteModal
        open={deleteModalOpen}
        worklog={deletingWorklog}
        loading={deleting}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingWorklog(null);
        }}
        onConfirm={handleDeleteWorklog}
      />
      <WorklogDetailsModal
        open={viewWorklogModalOpen}
        worklog={viewingWorklog}
        onClose={() => {
          setViewWorklogModalOpen(false);
          setViewingWorklog(null);
        }}
      />
    </main>
  );
}
