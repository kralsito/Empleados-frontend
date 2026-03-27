import 'server-only';
import { apiRequest } from '../api';
import { AplicarPagoResult, PaymentDetail } from '../models/payment/payment';

export interface AplicarPagoFormInput {
    employeeId: number;
    date: string;
    amount: number;
    complete: boolean;
    paymentMethod: string;
    paymentProof?: File | null;
}

export async function applyPayment(data: AplicarPagoFormInput): Promise<AplicarPagoResult> {
    const form = new FormData();
    form.append('employeeId', String(data.employeeId));
    form.append('date', data.date);
    form.append('amount', String(data.amount));
    form.append('complete', String(data.complete));
    form.append('paymentMethod', data.paymentMethod);
    if (data.paymentProof) {
        form.append('paymentProof', data.paymentProof);
    }

    const response = await apiRequest<AplicarPagoResult>('/payments/apply', 'POST', form, 'multipart/form-data');

    if (!response.data) {
        throw new Error('Error al aplicar el pago en la API');
    }

    return response.data;
}

export async function getPaymentsByEmployee(
    employeeId: number,
    filters?: { from?: string; to?: string },
): Promise<PaymentDetail[]> {
    const params = new URLSearchParams();
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);

    const query = params.toString();
    const endpoint = `/payments/employee/${employeeId}${query ? `?${query}` : ''}`;
    const response = await apiRequest<PaymentDetail[]>(endpoint, 'GET');

    if (!response.data) {
        throw new Error('Error al obtener el historial de pagos');
    }

    return response.data;
}
