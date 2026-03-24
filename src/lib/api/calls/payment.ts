import 'server-only';
import { apiRequest } from '../api';
import { AplicarPagoInput, AplicarPagoResult, PaymentDetail } from '../models/payment/payment';

export async function applyPayment(data: AplicarPagoInput): Promise<AplicarPagoResult> {
    const response = await apiRequest<AplicarPagoResult>('/payments/apply', 'POST', data);

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
