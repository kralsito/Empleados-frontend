export type HandleStatus = 'PENDIENTE' | 'PARCIAL' | 'PAGADO';

export interface MockEmployee {
  id: number;
  name: string;
  lastName: string;
  role: string;
  salaryHour: number;
}

export interface MockWorklog {
  id: number;
  employeeId: number;
  date: string; // yyyy-mm-dd
  description: string;
  hours: number;
  amount: number;
  paidAmount: number;
}

export interface MockPayment {
  id: number;
  employeeId: number;
  date: string;
  amount: number;
  assignedWorklogs: {
    worklogId: number;
    paidAmount: number;
  }[];
  type: 'COMPLETO' | 'PARCIAL';
}

const employees: MockEmployee[] = [
  { id: 1, name: 'Pablo', lastName: 'Ruiz', role: 'Operativo', salaryHour: 10000 },
  { id: 2, name: 'Maria', lastName: 'Gomez', role: 'Administrativa', salaryHour: 10000 },
  { id: 3, name: 'Javier', lastName: 'Martinez', role: 'Tecnico', salaryHour: 10000 },
];

const worklogs: MockWorklog[] = [
  { id: 101, employeeId: 1, date: '2026-03-01', description: 'Control de inventario', hours: 8, amount: 80000, paidAmount: 0 },
  { id: 102, employeeId: 1, date: '2026-03-02', description: 'Carga de datos', hours: 7, amount: 70000, paidAmount: 0 },
  { id: 103, employeeId: 1, date: '2026-03-05', description: 'Asistencia cliente', hours: 6, amount: 60000, paidAmount: 0 },
  { id: 201, employeeId: 2, date: '2026-03-03', description: 'Informe semanal', hours: 5, amount: 50000, paidAmount: 10000 },
  { id: 202, employeeId: 2, date: '2026-03-07', description: 'Cuentas y facturas', hours: 9, amount: 90000, paidAmount: 90000 },
  { id: 301, employeeId: 3, date: '2026-03-04', description: 'Mantenimiento de equipo', hours: 10, amount: 100000, paidAmount: 0 },
];

const payments: MockPayment[] = [
  { id: 1, employeeId: 2, date: '2026-03-10', amount: 10000, assignedWorklogs: [{ worklogId: 201, paidAmount: 10000 }], type: 'PARCIAL' },
  { id: 2, employeeId: 2, date: '2026-03-12', amount: 90000, assignedWorklogs: [{ worklogId: 202, paidAmount: 90000 }], type: 'COMPLETO' },
];

function getStatus(worklog: MockWorklog): HandleStatus {
  if (worklog.paidAmount >= worklog.amount) return 'PAGADO';
  if (worklog.paidAmount > 0) return 'PARCIAL';
  return 'PENDIENTE';
}

export function listEmployees(query: string = ''): Promise<MockEmployee[]> {
  const normalized = query.trim().toLowerCase();
  const result = normalized
    ? employees.filter((current) => `${current.name} ${current.lastName}`.toLowerCase().includes(normalized))
    : [...employees];

  return Promise.resolve(result);
}

export function getWorklogsForEmployee(employeeId: number): Promise<(MockWorklog & { status: HandleStatus; remaining: number })[]> {
  const worklogList = worklogs
    .filter((worklog) => worklog.employeeId === employeeId)
    .map((worklog) => ({ ...worklog, status: getStatus(worklog), remaining: Math.max(0, worklog.amount - worklog.paidAmount) }));

  return Promise.resolve(worklogList);
}

export function getPaymentsForEmployee(employeeId: number): Promise<MockPayment[]> {
  return Promise.resolve(payments.filter((payment) => payment.employeeId === employeeId));
}

interface DoPaymentInput {
  employeeId: number;
  date: string;
  amount: number;
  complete: boolean;
}

interface CreateWorklogInput {
  employeeId: number;
  date: string;
  hours: number;
  description: string;
}

interface UpdateWorklogInput {
  worklogId: number;
  hours: number;
  description: string;
}

interface DeleteWorklogInput {
  worklogId: number;
}

function isHalfHourStep(value: number): boolean {
  return Number.isFinite(value) && Math.abs(value * 2 - Math.round(value * 2)) < 0.0001;
}

export function applyPayment({ employeeId, date, amount, complete }: DoPaymentInput): Promise<{ updatedWorklogs: MockWorklog[]; newPayment: MockPayment }> {
  const activeWorklogs = worklogs
    .filter((worklog) => worklog.employeeId === employeeId && worklog.paidAmount < worklog.amount)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (amount <= 0) {
    return Promise.reject(new Error('El monto de pago debe ser mayor que cero'));
  }

  const totalPending = activeWorklogs.reduce((acc, worklog) => acc + (worklog.amount - worklog.paidAmount), 0);

  if (amount > totalPending) {
    return Promise.reject(new Error('El monto no puede exceder el total pendiente'));
  }

  let remainingToPay = amount;
  const assignedWorklogs: { worklogId: number; paidAmount: number }[] = [];

  for (const worklog of activeWorklogs) {
    if (remainingToPay <= 0) break;

    const pending = worklog.amount - worklog.paidAmount;
    const payNow = complete ? pending : Math.min(pending, remainingToPay);

    if (payNow > 0) {
      worklog.paidAmount += payNow;
      remainingToPay -= payNow;
      assignedWorklogs.push({ worklogId: worklog.id, paidAmount: payNow });
    }
  }

  const paymentType: 'COMPLETO' | 'PARCIAL' = complete ? 'COMPLETO' : 'PARCIAL';
  const newId = payments.length ? Math.max(...payments.map((payment) => payment.id)) + 1 : 1;

  const newPayment: MockPayment = {
    id: newId,
    employeeId,
    date,
    amount,
    assignedWorklogs,
    type: paymentType,
  };

  payments.push(newPayment);

  return Promise.resolve({ updatedWorklogs: activeWorklogs, newPayment });
}

export function createWorklog({ employeeId, date, hours, description }: CreateWorklogInput): Promise<MockWorklog> {
  const employee = employees.find((current) => current.id === employeeId);

  if (!employee) {
    return Promise.reject(new Error('No se encontro el empleado'));
  }

  if (!date) {
    return Promise.reject(new Error('La fecha del worklog es obligatoria'));
  }

  if (hours < 0.5 || hours > 24) {
    return Promise.reject(new Error('Las horas deben estar entre 0.5 y 24'));
  }

  if (!isHalfHourStep(hours)) {
    return Promise.reject(new Error('Las horas deben cargarse en bloques de 30 minutos'));
  }

  if (!description.trim()) {
    return Promise.reject(new Error('La descripcion es obligatoria'));
  }

  const alreadyExists = worklogs.some((current) => current.employeeId === employeeId && current.date === date);
  if (alreadyExists) {
    return Promise.reject(new Error('Ya existe un worklog para ese empleado en esa fecha'));
  }

  const newId = worklogs.length ? Math.max(...worklogs.map((current) => current.id)) + 1 : 1;
  const amount = Math.round(hours * employee.salaryHour);

  const worklog: MockWorklog = {
    id: newId,
    employeeId,
    date,
    description: description.trim(),
    hours,
    amount,
    paidAmount: 0,
  };

  worklogs.push(worklog);
  return Promise.resolve(worklog);
}

export function updateWorklog({ worklogId, hours, description }: UpdateWorklogInput): Promise<MockWorklog> {
  const worklog = worklogs.find((current) => current.id === worklogId);
  if (!worklog) {
    return Promise.reject(new Error("No se encontro el worklog"));
  }

  if (getStatus(worklog) !== "PENDIENTE") {
    return Promise.reject(new Error("Solo se pueden editar worklogs pendientes"));
  }

  if (hours < 0.5 || hours > 24) {
    return Promise.reject(new Error("Las horas deben estar entre 0.5 y 24"));
  }

  if (!isHalfHourStep(hours)) {
    return Promise.reject(new Error("Las horas deben cargarse en bloques de 30 minutos"));
  }

  if (!description.trim()) {
    return Promise.reject(new Error("La descripcion es obligatoria"));
  }

  const employee = employees.find((current) => current.id === worklog.employeeId);
  if (!employee) {
    return Promise.reject(new Error("No se encontro el empleado"));
  }

  worklog.hours = hours;
  worklog.description = description.trim();
  worklog.amount = Math.round(hours * employee.salaryHour);

  return Promise.resolve(worklog);
}

export function deleteWorklog({ worklogId }: DeleteWorklogInput): Promise<void> {
  const index = worklogs.findIndex((current) => current.id === worklogId);
  if (index === -1) {
    return Promise.reject(new Error("No se encontro el worklog"));
  }

  const worklog = worklogs[index];
  if (getStatus(worklog) !== "PENDIENTE") {
    return Promise.reject(new Error("Solo se pueden borrar worklogs pendientes"));
  }

  worklogs.splice(index, 1);
  return Promise.resolve();
}
