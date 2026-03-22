# Handoff Backend: Alineacion Horarios y Pagos (Mocks -> API real)

## Contexto
Este documento resume lo que hoy usa el frontend en `horarios-pagos` con mocks y lo que falta en backend para reemplazar esos mocks por API real.

Analisis hecho sobre:
- Backend: `Empleados/src/main/java/com/gestion/empleados/domains/worklog/*` y `.../payment/*`
- Frontend (mocks): `Empleados-frontend/src/lib/api/mocks/horariosPagosMock.ts`
- Frontend (pantallas): `Empleados-frontend/src/app/(root)/horarios-pagos/*`

---

## 1) Estado actual del backend (real)

### WorkLog actual
Archivo: `domains/worklog/model/WorkLog.java`

Campos actuales:
- `id`
- `employee`
- `date`
- `hoursWorked`
- `salaryHourSnapshot`
- `totalDay`

No tiene:
- `description`
- `paidAmount`
- estado de pago por worklog (`PENDIENTE/PARCIAL/PAGADO`)

Regla actual ya implementada en backend:
- `salaryHourSnapshot` se toma del rol del empleado al crear el worklog.
- `totalDay` se calcula como: `hoursWorked * salaryHourSnapshot`.
- Referencia: `WorkLogServiceImpl#create`.

### Payment actual
Archivo: `domains/payment/model/Payment.java`

Campos actuales:
- `id`
- `employee`
- `periodStart`
- `periodEnd`
- `totalHours`
- `totalAmount`
- `paymentMethod` (`EFECTIVO|TRANSFERENCIA|COMBINADO`)
- `paidAt`
- `paid` (boolean)

Modelo actual orientado a "liquidacion por periodo", no a "aplicar pagos parciales por worklog".

### Endpoints actuales relevantes
- `GET /work-logs/employee/{employeeId}`
- `POST /payments`
- `PATCH /payments/{id}/pay`
- `GET /payments/employee/{employeeId}`

---

## 2) Lo que hoy usa el frontend con mocks

Archivo base: `Empleados-frontend/src/lib/api/mocks/horariosPagosMock.ts`

### Worklog mock usado por UI
```ts
{
  id,
  employeeId,
  date,
  description,
  hours,   // mapea a hoursWorked
  amount,  // mapea a totalDay (calculado en backend)
  paidAmount,
  status,     // calculado: PENDIENTE | PARCIAL | PAGADO
  remaining   // calculado: amount - paidAmount
}
```

### Payment mock usado por UI
```ts
{
  id,
  employeeId,
  date,
  amount,
  type, // COMPLETO | PARCIAL
  assignedWorklogs: [
    { worklogId, paidAmount }
  ]
}
```

### Comportamiento de negocio implementado en mocks
- Pago parcial o completo.
- Distribucion FIFO por fecha de worklog (del mas antiguo al mas nuevo).
- Validaciones:
  - monto > 0
  - monto <= total pendiente
- Actualizacion de `paidAmount` por worklog.
- Estado por worklog:
  - `PENDIENTE`: pagado 0
  - `PARCIAL`: pagado > 0 y < total
  - `PAGADO`: pagado >= total

---

## 3) Gap principal (backend vs frontend)

1. `WorkLog` backend no guarda progreso de pago por registro (`paidAmount`).
2. No existe relacion de asignacion de un pago a multiples worklogs (detalle de aplicacion).
3. `Payment` backend hoy representa "periodo + metodo + paid boolean", pero UI necesita "evento de pago" con tipo `COMPLETO/PARCIAL` y detalle por worklog.
4. No existe endpoint transaccional que "aplique" pago y haga reparto FIFO.

---

## 4) Cambios requeridos en backend (recomendado)

## 4.1 Modelo de datos

### WorkLog (extender)
Agregar campos:
- `description` (`String`, opcional/recomendado)
- `paidAmount` (`BigDecimal`, default `0`)

Notas:
- `status` y `remaining` pueden ser calculados en DTO (no obligatorio persistir).

### Payment (ajustar para flujo de eventos de pago)
Agregar/usar:
- `paymentDate` (`LocalDate`) para fecha visible del pago
- `amount` (`BigDecimal`) monto efectivamente aplicado en ese evento
- `paymentType` (`COMPLETO|PARCIAL`) para la UI

Mantener opcionalmente campos actuales por compatibilidad (`periodStart`, `periodEnd`, `paid`, etc.) si hay otros modulos que los usan.

### Nueva entidad de detalle (recomendada)
`PaymentAllocation` (o nombre equivalente)
- `id`
- `payment` (ManyToOne)
- `workLog` (ManyToOne)
- `paidAmount` (`BigDecimal`)

Esto habilita `assignedWorklogs` en la respuesta.

---

## 4.2 Endpoints necesarios para reemplazar mocks

### A) Listar worklogs de empleado para pantalla detalle
`GET /work-logs/employee/{employeeId}`

Responder cada item con:
- `id`
- `employeeId`
- `date`
- `description`
- `hours` (o mapear de `hoursWorked`)
- `amount` (o mapear de `totalDay`)
- `paidAmount`
- `status` (derivado)
- `remaining` (derivado)

### B) Historial de pagos por empleado
`GET /payments/employee/{employeeId}`

Responder cada pago con:
- `id`
- `employeeId`
- `date` (`paymentDate`)
- `amount`
- `type` (`COMPLETO|PARCIAL`)
- `assignedWorklogs[]` con `{ worklogId, paidAmount }`

### C) Aplicar pago (endpoint transaccional nuevo)
`POST /payments/apply`

Request:
```json
{
  "employeeId": 2,
  "date": "2026-03-21",
  "amount": 40000,
  "complete": false
}
```

Comportamiento:
- Buscar worklogs con pendiente (`paidAmount < totalDay`) ordenados por `date ASC`.
- Validar monto.
- Repartir FIFO.
- Actualizar `paidAmount` de worklogs afectados.
- Crear `Payment` + `PaymentAllocation`.
- Responder pago creado y/o worklogs actualizados.

---

## 5) Reglas de negocio a implementar (igual que mocks)

1. `amount > 0`.
2. `amount <= totalPendienteEmpleado`.
3. Si `complete=true`, pagar todo lo pendiente (el frontend hoy manda `amount = total pendiente`).
4. Reparto FIFO por fecha de worklog ascendente.
5. Operacion transaccional atomica (si falla una parte, rollback completo).

Recomendacion tecnica:
- Lock pesimista al cargar worklogs pendientes del empleado durante `apply` para evitar doble aplicacion concurrente.

---

## 6) Mapeo de campos (backend actual -> frontend esperado)

- `hoursWorked` -> `hours`
- `salaryHourSnapshot` = valor hora del rol al momento de crear el worklog
- `totalDay` = `hoursWorked * salaryHourSnapshot`
- `totalDay` -> `amount` (frontend no deberia recalcular este valor)
- `paymentDate` (nuevo) -> `date`
- `paymentType` (nuevo) -> `type`
- `WorkLog.paidAmount` (nuevo) -> `paidAmount`
- `remaining` = `totalDay - paidAmount` (derivado)
- `status` derivado por regla de negocio

---

## 7) Plan de implementacion sugerido (orden)

1. Extender entidades y DB (`WorkLog.paidAmount`, `WorkLog.description`, `PaymentAllocation`, `paymentDate`, `paymentType`).
2. Crear DTOs nuevos para `apply` y respuestas de historial.
3. Implementar `POST /payments/apply` con logica FIFO transaccional.
4. Ajustar `GET /work-logs/employee/{id}` para devolver `paidAmount/status/remaining`.
5. Ajustar `GET /payments/employee/{id}` para incluir `assignedWorklogs` y `type`.
6. Mantener endpoints anteriores de periodo si otro flujo los requiere (compatibilidad).

---

## 8) Riesgos / decisiones a confirmar

1. Si el modulo viejo de pagos por periodo se sigue usando, conviene separar:
- `Payment` (evento de pago UI Horarios/Pagos)
- `Payroll` o `Settlement` (liquidacion por periodo)

2. Si se mantiene una sola tabla `payments`, definir claramente campos opcionales y reglas de consistencia.

3. Definir precision monetaria en BD (`DECIMAL(15,2)` o superior) y normalizar rounding.

---

## 9) Criterio de aceptacion para dar de baja mocks

- El flujo completo funciona solo con API real:
  - Listado empleados
  - Ver worklogs pendientes/pagados
  - Aplicar pago completo/parcial
  - Ver historial de pagos con detalle por worklog
- Los valores de `pending/paid/remaining/status` coinciden con la logica mock actual.
- Frontend deja de importar `horariosPagosMock.ts`.

---

## 10) Referencias de codigo revisadas

Backend:
- `Empleados/src/main/java/com/gestion/empleados/domains/worklog/model/WorkLog.java`
- `Empleados/src/main/java/com/gestion/empleados/domains/worklog/controller/WorkLogController.java`
- `Empleados/src/main/java/com/gestion/empleados/domains/worklog/service/Impl/WorkLogServiceImpl.java`
- `Empleados/src/main/java/com/gestion/empleados/domains/payment/model/Payment.java`
- `Empleados/src/main/java/com/gestion/empleados/domains/payment/controller/PaymentController.java`
- `Empleados/src/main/java/com/gestion/empleados/domains/payment/service/impl/PaymentServiceImpl.java`

Frontend:
- `Empleados-frontend/src/lib/api/mocks/horariosPagosMock.ts`
- `Empleados-frontend/src/app/(root)/horarios-pagos/[employeeId]/page.tsx`
- `Empleados-frontend/src/app/(root)/horarios-pagos/components/WorklogsTable.tsx`
- `Empleados-frontend/src/app/(root)/horarios-pagos/components/PaymentsHistoryTable.tsx`
