# Documentación del Backend API (Gestión Empleados)

Este documento detalla los *Endpoints* (rutas) expuestas por el backend (creado en Java/Spring Boot) que el frontend necesita consumir para realizar las altas, bajas, modificaciones y consultas (CRUD).

La URL base del servidor local es: `http://localhost:8080` (según configurado en `src/lib/api/api.ts`).

---

## 1. Módulo: Empleados (`/employee`)

Este módulo se encarga de gestionar a los trabajadores de la empresa.

### 1.1 Alta de Empleado
- **Método:** `POST`
- **Ruta:** `/employee`
- **Requiere Autenticación:** Sí (Bearer JWT)
- **Cuerpo de la Petición (JSON Esperado):**
  Para crear un empleado, el backend espera exactamente estos campos:
  ```json
  {
    "name": "Juan",        // Obligatorio (NotBlank)
    "lastName": "Perez",   // Obligatorio (NotBlank)
    "roleId": 1            // Obligatorio (NotNull). ID numérico del rol asignado.
  }
  ```
  *(Nota para el frontend: Cuidado, los campos esperados son `name` y `lastName`, no `nombre` y `apellido` como habíamos figurado en el ejemplo anterior).*

### 1.2 Obtener Todos los Empleados
- **Método:** `GET`
- **Ruta:** `/employee`
- **Requiere Autenticación:** Sí (Bearer JWT)
- **Respuesta:** Retorna una lista (Array) de objetos `EmployeeDTO` con todos los empleados.

### 1.3 Obtener Empleado por ID y por Rol
- `GET /employee/{id}`: Trae los datos de un único empleado según su número de ID.
- `GET /employee/role/{roleId}`: Trae una lista de todos los empleados que tengan asignado cierto rol.

### 1.4 Modificar o Borrar
- `PUT /employee/{id}`: Actualiza los datos de un empleado (espera el mismo JSON que el POST).
- `DELETE /employee/{id}`: Elimina al empleado del sistema.

---

## 2. Módulo: Roles (`/role`)

Este módulo gestiona los puestos de trabajo y el pago asociado a ellos. Cada empleado debe tener asignado un rol.

### 2.1 Alta de Rol
- **Método:** `POST`
- **Ruta:** `/role`
- **Requiere Autenticación:** Sí (Bearer JWT)
- **Cuerpo de la Petición (JSON Esperado):**
  ```json
  {
    "name": "Mozo",           // Nombre del rol
    "salaryHour": 3500.50     // Número decimal (BigDecimal en Java) que representa el pago por hora
  }
  ```

### 2.2 Consultas de Roles
- `GET /role`: Obtiene la lista completa de roles creados (ideal para rellenar el `<select>` en el formulario de Alta Empleado).
- `GET /role/{id}`: Obtiene un rol específico.

### 2.3 Modificar o Borrar
- `PUT /role/{id}`: Actualiza los datos de un rol (espera el mismo JSON que el POST).
- `DELETE /role/{id}`: Elimina el rol del sistema.

---

## Integración Frontend 🚀

**Resumen de Tareas para el Frontend basado en esto:**
1. Crear el Server Action y la llamada api para **Roles** (para crear y listar roles).
2. En la página de Alta Empleado (`/configuracion/empleados`), primero hay que hacer un `GET /role` para obtener la lista, y mostrar esos nombres en un elemento `<select>`.
3. Cuando el usuario hace Submit en Alta Empleado, hay que mandar el JSON con las claves en inglés (`name`, `lastName`, `roleId`) mediante un `POST /employee`.
