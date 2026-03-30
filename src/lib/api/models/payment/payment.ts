import { WorklogDetail } from '../worklog/worklog';

export type TipoPago = 'COMPLETO' | 'PARCIAL';
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'COMBINADO';

export interface PaymentAllocation {
    worklogId: number;
    date: string;
    description: string | null;
    hours: number;
    paidAmount: number;
}

export interface PaymentDetail {
    id: number;
    employeeId: number;
    date: string;
    amount: number;
    type: TipoPago;
    paidAt: string | null;
    paymentMethod: MetodoPago | null;
    paymentProof: string | null;
    totalWorkedHours: number;
    assignedWorklogs: PaymentAllocation[];
}


export interface AplicarPagoResult {
    payment: PaymentDetail;
    updatedWorklogs: WorklogDetail[];
}
