# Sistema de Gestión de Empleados

## Descripción general

Aplicación web para gestionar empleados, registrar horas trabajadas y administrar pagos. El administrador se loguea y desde ahí puede dar de alta empleados, cargar las horas trabajadas día a día, y liquidar el sueldo de cada empleado al final del período.

---

## Roles y acceso

El sistema tiene un único usuario administrador que se autentica con email y contraseña. Una vez logueado recibe un token JWT que se usa en todas las requests posteriores.

---

## Módulos

### 1. Roles

Los empleados se dividen en tipos según su función. Cada tipo tiene un sueldo por hora diferente.

**Datos:**
- Nombre del rol (ej: Comercial, Limpieza)
- Sueldo por hora

**Operaciones:**
- Crear un rol
- Editar nombre y sueldo por hora
- Eliminar un rol (solo si no tiene empleados asociados)
- Listar todos los roles

---

### 2. Empleados

Cada empleado está asociado a un rol, del cual hereda el sueldo por hora.

**Datos:**
- Nombre y apellido
- Rol asignado
- Estado activo/inactivo

**Operaciones:**
- Crear un empleado y asignarle un rol
- Editar nombre, apellido o rol
- Desactivar un empleado (soft delete, no se borra de la base de datos)
- Listar empleados activos
- Filtrar empleados por rol

---

### 3. Registro de horas (WorkLog)

El administrador entra al sistema y selecciona un día del calendario. Para ese día carga uno o más empleados con la cantidad de horas que trabajaron. Cada empleado tiene un único registro por día.

**Datos:**
- Empleado
- Fecha
- Horas trabajadas
- Sueldo por hora al momento del registro *(snapshot)*
- Total del día = horas trabajadas × sueldo por hora

**Operaciones:**
- Cargar horas para un empleado en un día
- Editar un registro (si se equivocó en las horas)
- Eliminar un registro
- Ver registros de un empleado
- Ver registros de un empleado en un período determinado
- Ver registros de todos los empleados en un período

> **Nota importante:** El sueldo por hora se guarda como snapshot al momento de registrar. Esto garantiza que si el sueldo del rol cambia en el futuro, los registros históricos no se vean afectados.

---

### 4. Pagos

Al final del período (puede ser semanal, quincenal, mensual o cualquier rango) el administrador genera el pago de un empleado. El sistema calcula automáticamente el total sumando los `totalDía` de todos los registros dentro del rango de fechas seleccionado.

**Datos:**
- Empleado
- Fecha de inicio del período
- Fecha de fin del período
- Total de horas trabajadas en el período
- Total a cobrar
- Método de pago (Efectivo, Transferencia)
- Fecha y hora en que se confirmó el pago
- Estado: pagado / pendiente

**Operaciones:**
- Crear un pago (se calcula automáticamente el total del período)
- Editar el rango de fechas o el método de pago (solo si aún no está pagado)
- Confirmar el pago → se marca como pagado y se guarda la fecha/hora
- Ver historial de pagos de un empleado
- Ver todos los pagos

> **Regla importante:** Una vez confirmado el pago no puede modificarse. Esto garantiza la integridad del historial.

---

## Flujo completo

```
1. El administrador se loguea
        ↓
2. Da de alta un rol (ej: Comercial - $1500/hora)
        ↓
3. Da de alta empleados y los asocia a un rol
        ↓
4. Cada día entra al calendario, selecciona la fecha
   y carga las horas trabajadas por cada empleado
        ↓
5. Al final del período va al módulo de Pagos,
   selecciona el empleado y el rango de fechas
        ↓
6. El sistema calcula automáticamente el total
        ↓
7. El administrador elige el método de pago
   y confirma → el pago queda registrado
```

---

## Modelo de datos

```
Role
├── id
├── name
└── salaryHour

Employee
├── id
├── name
├── lastName
├── active
└── role_id → Role

WorkLog
├── id
├── employee_id → Employee
├── date
├── hoursWorked
├── salaryHourSnapshot
└── totalDay

Payment
├── id
├── employee_id → Employee
├── periodStart
├── periodEnd
├── totalHours
├── totalAmount
├── paymentMethod (EFECTIVO, TRANSFERENCIA)
├── paidAt
└── paid
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Spring Boot 3 + Spring Security + JWT |
| Base de datos | MySQL |
| ORM | Spring Data JPA + Hibernate |
| Mapeo | MapStruct |
| Frontend | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS |
| Estado global | Zustand |
| Formularios | React Hook Form + Zod |
| HTTP client | Axios |

---

## API REST

### Auth
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/register` | Registrar administrador |

### Roles
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/role` | Listar roles |
| GET | `/role/{id}` | Obtener rol |
| POST | `/role` | Crear rol |
| PUT | `/role/{id}` | Editar rol |
| DELETE | `/role/{id}` | Eliminar rol |

### Empleados
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/employee` | Listar empleados activos |
| GET | `/employee/{id}` | Obtener empleado |
| GET | `/employee/role/{roleId}` | Filtrar por rol |
| POST | `/employee` | Crear empleado |
| PUT | `/employee/{id}` | Editar empleado |
| DELETE | `/employee/{id}` | Desactivar empleado |

### Registro de horas
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/work-logs` | Cargar horas |
| PUT | `/work-logs/{id}` | Editar registro |
| DELETE | `/work-logs/{id}` | Eliminar registro |
| GET | `/work-logs/employee/{id}` | Historial de un empleado |
| GET | `/work-logs/employee/{id}/period?from=&to=` | Registros por período |
| GET | `/work-logs/period?from=&to=` | Todos los empleados por período |

### Pagos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/payments` | Listar todos los pagos |
| GET | `/payments/{id}` | Obtener pago |
| GET | `/payments/employee/{id}` | Pagos de un empleado |
| POST | `/payments` | Crear pago |
| PUT | `/payments/{id}` | Editar período o método |
| PATCH | `/payments/{id}/pay` | Confirmar pago |
| DELETE | `/payments/{id}` | Eliminar pago pendiente |
