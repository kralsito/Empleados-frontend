import { Empleado } from '../employee/employee';

export type WorklogStatus = 'PENDIENTE' | 'PARCIAL' | 'PAGADO';

export interface Worklog {
    id: number;
    employee: Empleado;
    date: string;
    dayOfWeek: string;
    hoursWorked: number;
    salaryHourSnapshot: number;
    totalDay: number;
}

export interface WorklogDetail {
    id: number;
    employeeId: number;
    date: string;
    dayOfWeek: string;
    description: string | null;
    hours: number;
    amount: number;
    paidAmount: number;
    remaining: number;
    status: WorklogStatus;
}

export interface NuevoWorklogInput {
    employeeId: number;
    date: string;
    description: string;
    hoursWorked: number;
}

