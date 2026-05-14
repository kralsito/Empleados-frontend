# Cambios: Multiusuario + Roles de Seguridad

## Contexto y motivación

El sistema originalmente fue diseñado para un único administrador que gestionaba empleados, roles, worklogs y pagos. A medida que el negocio creció, surgió la necesidad de que múltiples usuarios pudieran usar la aplicación de forma independiente, cada uno con sus propios empleados y datos, sin que uno pudiera ver o modificar los datos del otro.

Para lograr esto se implementaron dos cambios fundamentales:

1. **Sistema de roles de seguridad**: separar quién puede administrar usuarios (ADMIN) de quién opera el negocio (USER).
2. **Aislamiento de datos por usuario**: cada entidad de negocio quedó asociada al usuario que la creó, garantizando que los datos de un usuario sean invisibles para otro.

---

## 1. Sistema de Roles de Seguridad

### ¿Qué cambió a nivel de negocio?

Antes, cualquier persona que se registrara podía operar el sistema completo. No había distinción entre el dueño de la aplicación y los clientes que la usan.

Ahora existen dos tipos de usuarios con responsabilidades claramente separadas:

- **ADMIN**: Es el dueño o desarrollador de la aplicación. Su única función es crear y gestionar cuentas de usuario. No tiene acceso a los datos de negocio (roles, empleados, worklogs, pagos). Hay un único endpoint reservado para él: `POST /auth/users`.

- **USER**: Es el cliente que usa la aplicación. Puede gestionar todo lo relacionado con su negocio: roles, empleados, worklogs y pagos. No puede crear otros usuarios.

Esta separación evita que un cliente pueda registrar nuevas cuentas por su cuenta, manteniendo el control de acceso en manos del administrador.

### Cambios técnicos

**`User` (model)**

Se agregó el campo `userRole` que define si el usuario es `ADMIN` o `USER`. Este valor se persiste en la base de datos como un string gracias a `@Enumerated(EnumType.STRING)`.

```java
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private UserRole userRole;

public enum UserRole {
    ADMIN, USER
}
```

**`CustomUserDetails`**

Spring Security necesita saber qué permisos tiene un usuario para aplicar las reglas de acceso. El método `getAuthorities()` devuelve los roles del usuario en el formato que Spring entiende: con el prefijo `ROLE_`. Si el usuario es `ADMIN`, Spring Security lo verá como `ROLE_ADMIN`.

```java
@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + user.getUserRole().name()));
}
```

**`JwtUtil`**

El token JWT ahora incluye el rol del usuario como un claim adicional. Esto permite que el frontend pueda leer el rol desde el token y mostrar u ocultar funcionalidades según corresponda, sin necesidad de hacer una llamada extra al backend.

```java
public static String buildToken(String email, Long userId, User.UserRole role) {
    return JWT.create()
            .withSubject(email)
            .withIssuedAt(new Date())
            .withExpiresAt(new Date(System.currentTimeMillis() + jwtExpiration))
            .withClaim("userId", userId)
            .withClaim("role", role.name())
            .sign(signingAlgorithm);
}
```

**`AuthController`**

Se separaron los endpoints de registro según el tipo de usuario a crear. El endpoint `/auth/register` siempre crea un `ADMIN` y queda reservado para uso interno. El endpoint `/auth/users` es el que el `ADMIN` usa para dar de alta clientes, y está protegido para que solo él pueda accederlo.

```java
@PostMapping("/register")
public ResponseEntity<Void> register(@RequestBody UserDTOin dto) {
    authService.register(dto, User.UserRole.ADMIN);
    return ResponseEntity.status(HttpStatus.CREATED).build();
}

@PostMapping("/users")
@Operation(summary = "Da de alta un usuario común", security = { @SecurityRequirement(name = "bearer-jwt") })
public ResponseEntity<Void> createUser(@RequestBody UserDTOin dto) {
    authService.register(dto, User.UserRole.USER);
    return ResponseEntity.status(HttpStatus.CREATED).build();
}
```

**`SecurityConfig`**

Se definen las reglas de acceso por rol a nivel de rutas HTTP. El orden de las reglas importa: Spring Security las evalúa de arriba hacia abajo y aplica la primera que coincide.

```java
httpSecurity.authorizeHttpRequests(
    auth -> auth
        .requestMatchers("/auth/login", "/auth/register").permitAll()
        .requestMatchers(SWAGGER_WHITELIST).permitAll()
        .requestMatchers("/payments/*/proof").permitAll()
        .requestMatchers("/auth/users", "/auth/users/**").hasRole("ADMIN")
        .requestMatchers("/auth/admin/**").hasRole("ADMIN")
        .anyRequest().hasAnyRole("USER", "ADMIN")
);
```

---

## 2. Aislamiento de datos por usuario (Multiusuario)

### ¿Qué cambió a nivel de negocio?

Antes, todos los datos del sistema eran compartidos. Si dos clientes usaban la aplicación, verían los empleados, roles y pagos del otro.

Ahora cada cliente tiene su propio espacio de trabajo aislado:

- Un usuario solo puede ver y operar sus propios roles, empleados, worklogs y pagos.
- Si un usuario intenta acceder a un recurso que no le pertenece, el backend devuelve un error como si el recurso no existiera.
- El `userId` nunca se pasa desde el frontend. Siempre se extrae automáticamente del token JWT en el backend mediante `AuthSupport.getUserId()`. Esto garantiza que un usuario no pueda hacerse pasar por otro.

### Concepto clave: ownership

Cada entidad de negocio ahora tiene un "dueño" (owner). La relación es simple: `Role`, `Employee`, `WorkLog` y `Payment` tienen una FK `user_id` que apunta al usuario que los creó.

Cuando el backend recibe una request, antes de devolver o modificar cualquier dato, verifica que el recurso pertenezca al usuario logueado. Si no pertenece, lanza un error `NOT_FOUND` en lugar de `FORBIDDEN`, para no revelar la existencia del recurso a usuarios no autorizados.

### Cambios técnicos por entidad

---

### `Role`

**¿Qué cambió a nivel de negocio?**
Cada usuario tiene su propio catálogo de roles con sus propios sueldos por hora. El rol "Comercial" de un usuario puede tener un sueldo diferente al "Comercial" de otro usuario.

**Model:** se agregó la FK al usuario dueño.
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)
private User user;
```

**Repository:** se agregaron métodos que filtran por `userId`.
```java
List<Role> findAllByUserId(Long userId);
Optional<Role> findByIdAndUserId(Long id, Long userId);
```

**ServiceImpl:** todos los métodos obtienen el `userId` del token y filtran por él.
- `create` → asigna el usuario logueado como dueño del rol.
- `getAll` → solo devuelve los roles del usuario logueado.
- `getById`, `update`, `delete` → buscan por `id AND userId`, si no existe devuelven `NOT_FOUND`.

---

### `Employee`

**¿Qué cambió a nivel de negocio?**
Cada usuario gestiona su propio plantel de empleados. Un empleado solo puede ser asociado a un rol que pertenezca al mismo usuario, evitando mezclas entre datos de distintos clientes.

**Model:** se agregó la FK al usuario dueño.
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)
private User user;
```

**Repository:** se agregaron métodos filtrados por `userId`.
```java
List<Employee> findAllByActiveTrueAndUserId(Long userId);
Optional<Employee> findByIdAndUserId(Long id, Long userId);
List<Employee> findAllByRoleIdAndActiveTrueAndUserId(Long roleId, Long userId);
```

**ServiceImpl:**
- `create` → valida que el rol pertenezca al mismo usuario antes de asignarlo al empleado.
- `getAll` → solo devuelve empleados activos del usuario logueado.
- Se eliminó el método público `buscarPorId` que no filtraba por `userId` y era un potencial punto de fuga de datos.

---

### `WorkLog`

**¿Qué cambió a nivel de negocio?**
Los registros de horas son privados por usuario. Un usuario no puede ver ni cargar horas sobre empleados de otro usuario. Además, el lock pesimista en la consulta de worklogs pendientes evita condiciones de carrera si dos requests intentan aplicar un pago simultáneamente sobre el mismo empleado.

**Model:** se agregó la FK al usuario dueño.
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)
private User user;
```

**Repository:** se agregaron métodos filtrados por `userId`, incluyendo la query con lock pesimista para el proceso de pago FIFO.
```java
List<WorkLog> findAllByEmployeeIdAndUserId(Long employeeId, Long userId);
List<WorkLog> findAllByEmployeeIdAndDateBetweenAndUserId(Long employeeId, LocalDate from, LocalDate to, Long userId);
List<WorkLog> findAllByDateBetweenAndUserId(LocalDate from, LocalDate to, Long userId);
boolean existsByEmployeeIdAndDateAndUserId(Long employeeId, LocalDate date, Long userId);

@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT w FROM WorkLog w WHERE w.employee.id = :employeeId AND w.user.id = :userId AND w.paidAmount < w.totalDay ORDER BY w.date ASC")
List<WorkLog> findPendingByEmployeeIdAndUserIdOrderByDateAsc(@Param("employeeId") Long employeeId, @Param("userId") Long userId);
```

**ServiceImpl:**
- `create` → valida que el empleado pertenezca al usuario antes de crear el worklog.
- Todos los métodos de consulta filtran por `userId`.

---

### `Payment`

**¿Qué cambió a nivel de negocio?**
El historial de pagos es privado por usuario. Cada cliente ve únicamente sus propios pagos. El proceso de aplicación de pago FIFO también valida que el empleado y los worklogs pertenezcan al usuario logueado antes de ejecutar cualquier operación, evitando que un usuario pueda pagar worklogs de otro.

**Model:** se agregó la FK al usuario dueño.
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)
private User user;
```

**Repository:** se agregaron métodos filtrados por `userId`.
```java
List<Payment> findAllByUserId(Long userId);
List<Payment> findAllByEmployeeIdAndUserId(Long employeeId, Long userId);
List<Payment> findAllByEmployeeIdAndUserIdOrderByPaymentDateDescPaidAtDescIdDesc(Long employeeId, Long userId);
List<Payment> findAllByEmployeeIdAndUserIdAndPaymentDateBetweenOrderByPaymentDateDescPaidAtDescIdDesc(Long employeeId, Long userId, LocalDate from, LocalDate to);
Optional<Payment> findByIdAndUserId(Long id, Long userId);
```

**PaymentServiceImpl:**
- `create` → valida empleado y worklogs por `userId`, asigna el usuario como dueño del pago.
- `getAll` → solo devuelve pagos del usuario logueado.
- `getPayment` helper → busca por `id AND userId`.

**PaymentApplyServiceImpl:**
- `apply` → valida que el empleado y todos los worklogs pendientes pertenezcan al usuario logueado antes de ejecutar el reparto FIFO.
- `getWorklogsForEmployee` y `getPaymentsForEmployee` → filtran por `userId`.

---

## 3. Resumen de reglas de negocio

| Rol | Puede hacer |
|---|---|
| `ADMIN` | Crear y gestionar cuentas de usuario en `/auth/users` |
| `USER` | Gestionar roles, empleados, worklogs y pagos — solo los propios |

### Principios de diseño aplicados

- **Principio de mínimo privilegio**: cada usuario solo puede acceder a lo que necesita para cumplir su función. El `ADMIN` no puede tocar datos de negocio, y el `USER` no puede crear cuentas.

- **Ownership implícito**: el `userId` nunca lo manda el frontend, siempre se extrae del token JWT en el backend. Esto hace imposible que un usuario manipule datos de otro aunque lo intente.

- **Fail-safe**: cuando un recurso no pertenece al usuario logueado, el backend responde `NOT_FOUND` en lugar de `FORBIDDEN`, evitando revelar la existencia de recursos ajenos a otros usuarios.

- **Aislamiento total**: los datos de un usuario son completamente invisibles para otro. Cada cliente opera como si tuviera su propia instancia privada de la aplicación.

- **Snapshot de datos críticos**: el `salaryHourSnapshot` en `WorkLog` garantiza que los registros históricos no se vean afectados si el sueldo por hora de un rol cambia en el futuro. Cada registro guarda el valor vigente al momento de su creación.
