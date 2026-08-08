# AGENTS.md — Sistema de gestión para comercio (ex Price Tracker)

## Contexto

Arrancó como una herramienta simple para no memorizar precios (ya en producción: Render + Vercel). Esta es la expansión a **MVP versión 1.0**: carga de ventas, cuentas corrientes (fiado), gastos, facturas a proveedores, y reportes. Es un proyecto real para un cliente (primer caso de LIER), no un ejercicio — mantener la calidad y el manejo de errores acordes a eso.

**Fuera de alcance explícito de esta versión:** no se generan tickets/comprobantes imprimibles, no hay control de stock (cantidad disponible), solo se marca disponible/no disponible manualmente.

## Stack (igual al resto de mis proyectos)

- JavaScript puro (sin TypeScript).
- Backend: Node.js + Express.
- Validación: Zod.
- ORM: Sequelize sobre PostgreSQL.
- Frontend: React + Tailwind CSS.

## Arquitectura

Mismo patrón de siempre: `Route → Controller → Service → Model`, con validación Zod en cada endpoint que recibe datos. Nada de lógica de negocio en controllers ni en rutas.

## Estructura del servidor

- **`src/app.js`**: arma y exporta la instancia de Express (middlewares globales, rutas, error handler). No conecta a la base de datos ni levanta el server — solo define qué es la app. Esto permite testear la app con supertest sin abrir un puerto real.
- **`src/index.js`** (o `server.js`): importa `app.js`, conecta y sincroniza la base de datos, y recién ahí llama a `app.listen()`. Es el único archivo que "enciende" algo.
- **`src/routes/routes.js`**: agregador central de rutas. Cada recurso tiene su propio archivo de rutas (`auth.routes.js`, `products.routes.js`, etc.) montado bajo un prefijo (`/api/v1/...`) en este agregador — no montar cada router suelto directo en `app.js`.
- **Middlewares de seguridad en `app.js`**: `helmet()` para headers de seguridad, `cors()` con origin restringido en producción, y `express-rate-limit` — un limiter global suave (100 req/min) y uno más estricto específico para `/auth/login` (5 intentos/min), dado que el login de vendedor es una contraseña compartida y vale la pena protegerlo de fuerza bruta.
- No copiar lógica de negocio de otros proyectos al armar esto — la estructura (separación de archivos, middlewares de seguridad) es reutilizable, el contenido de negocio de cada proyecto no.

## Flujo de trabajo Git

- Rama base de desarrollo: `dev`. Todo el trabajo de esta expansión parte de ahí.
- **Una rama `feature/` por fase**, nombrada según la acción de esa fase (ej. `feature/auth-roles`, `feature/carga-de-ventas`, `feature/cierre-cuenta-corriente`). Crear la rama desde `dev` antes de empezar cada fase.
- Al terminar y probar una fase: `git add .`, commit con **Conventional/Semantic Commits** (`feat:`, `fix:`, `refactor:`, etc.), mergear esa rama `feature/` a `dev` (local, sin PR — el PR es solo para el merge a `main`), y `git push origin dev`.
- **Nunca hacer merge a `main`**. Ese paso lo hace el usuario manualmente, después de probar todo en Docker.
- No ejecutar `git init` ni comandos destructivos de Git sin mostrar el comando antes y esperar confirmación.

## Roles y autenticación

Dos roles, con login simple (usuario + contraseña, JWT):

- **Vendedor**: un único usuario/contraseña **compartido** entre todos los empleados que venden (no se distingue quién de ellos hizo cada venta).
- **Administrador**: usuario propio, separado del de vendedor.

No hay auto-registro. Los dos usuarios se crean por seed/script, no hay pantalla de "crear cuenta".

## Modelos de datos

### `Category`
- `id`, `name`

### `Product`
- `id`, `name`, `price` (decimal)
- `categoryId` (FK a `Category`)
- `saleType`: enum `'unidad' | 'kilo'` — define si `price` es por unidad o por kilogramo.
- `available` (boolean, default `true`) — reemplaza el borrado; "marcar NO DISPONIBLE" es `available: false`, no un DELETE.

### `Sale` (Venta)
- `id`, `date` (default now)
- `total` (decimal, calculado — suma de sus `SaleItem`)
- `paymentMethod`: enum `'MERCADO_PAGO' | 'CUENTA_DNI' | 'EFECTIVO' | 'CUENTA_CORRIENTE'`
- `creditAccountId` (FK a `CreditAccount`, **obligatorio si** `paymentMethod === 'CUENTA_CORRIENTE'`, si no `null`)
- `hasIssue` (boolean, default `false`) — para el reporte de inconvenientes.
- `issueNote` (texto, nullable) — solo se completa si `hasIssue` es `true`.

### `SaleItem`
- `id`, `saleId` (FK)
- `productId` (FK)
- `quantity` (decimal — para `saleType: 'unidad'` es cantidad de unidades; para `'kilo'` es el peso en kg)
- `unitPriceAtSale` (decimal — **snapshot** del precio del producto al momento de la venta; nunca recalcular con el precio actual del producto, los reportes históricos tienen que reflejar el precio real de ese día)
- `subtotal` (decimal — `quantity * unitPriceAtSale`)

### `CreditAccount` (Cuenta corriente / fiado)
- `id`, `name` (nombre de la persona)
- `balance` (decimal, default 0 — suma de los `CreditAccountItem` activos)
- Solo el **administrador** puede crear cuentas nuevas.

### `CreditAccountItem`
- `id`, `creditAccountId` (FK)
- `saleId` (FK a la venta que generó este cargo)
- `amount` (decimal)
- `date`
- `archived` (boolean, default `false`) — al "cerrar y marcar pagada" la cuenta, todos sus ítems activos pasan a `archived: true`. **No se borran**, quedan consultables para auditoría.
- `settledAt` (fecha, nullable — cuándo se archivó por el cierre)

### `Expense` (Gasto — sin proveedor, informal: verdulería, hipermercado, etc.)
- `id`, `amount`, `concept`, `category` (texto libre o enum simple: mercadería, servicios, otros), `date`

### `Invoice` (Factura — con proveedor formal)
- `id`, `amount`, `supplier`, `concept`, `category`, `invoiceNumber`
- `status`: enum `'PENDIENTE' | 'PAGADA'` (default `'PENDIENTE'` al crear)
- `date`, `paidAt` (nullable, se completa al marcar como `PAGADA`)

## Reglas de negocio clave

### Cálculo del total de una venta
El total de una `Sale` es siempre la suma de `subtotal` de sus `SaleItem`. Se recalcula en el service cada vez que se agrega/quita un ítem, nunca se deja que el frontend mande el total directamente — el backend es la fuente de verdad del cálculo.

### Venta por kilo
Si `Product.saleType === 'kilo'`, el vendedor carga el **peso** vendido (en kg) en vez de una cantidad de unidades. El `subtotal` se calcula igual: `peso * precioPorKilo`.

### Venta a cuenta corriente
1. El vendedor marca `paymentMethod: 'CUENTA_CORRIENTE'`.
2. El frontend muestra el listado de `CreditAccount` existentes (cargadas previamente por el admin) para elegir a quién se le fía.
3. Al confirmar, se crea la `Sale` normalmente **y además** un `CreditAccountItem` por el total, sumando al `balance` de esa cuenta.

### Cierre y pago de cuenta corriente (solo administrador)
1. **Generar cierre**: acción de solo lectura — devuelve el `balance` total y el detalle desglosado de todos los `CreditAccountItem` activos (no archivados) de esa cuenta. No modifica nada.
2. **Marcar como pagada**: acción que sí modifica — archiva (`archived: true`, `settledAt: now`) todos los ítems activos de esa cuenta, resetea `balance` a `0`, y registra el monto total como **ingreso del día en que se cobra** (ver "Ventas vs. Ingresos" abajo). Esto es distinto e independiente de la fecha original de cada venta que compone ese saldo.

### Ventas vs. Ingresos (distinción importante, confirmar con el usuario antes de implementar)
- **Reporte de Ventas**: todo lo facturado, sin importar el método de pago, agrupado por la fecha de cada `Sale`. Una venta a cuenta corriente cuenta acá el día que se hizo, aunque todavía no se haya cobrado.
- **Reporte de Ingresos**: dinero que efectivamente entró a la caja. Incluye ventas en `EFECTIVO`, `MERCADO_PAGO` y `CUENTA_DNI` (contadas el día de la venta), **más** los montos de cuentas corrientes saldadas (contados el día en que se marcaron como pagadas, no el día de la venta original).
- Estos dos reportes van a dar números distintos, y es esperado — el de Ventas mide actividad comercial, el de Ingresos mide caja real.

### Facturas
- Al cargar una factura, `status` arranca en `'PENDIENTE'` siempre.
- El administrador puede cambiar el estado a `'PAGADA'` (se completa `paidAt`).
- El reporte de facturas muestra el monto total pendiente y el monto total pagado, por separado.

### Gastos
- No tienen estado pendiente/pagado — se asume que un gasto informal (verdulería, insumos sueltos) se paga en el momento de cargarlo.

### Reporte de inconvenientes (versión simple)
- El vendedor puede marcar una venta ya cargada con `hasIssue: true` y una nota corta (`issueNote`).
- El administrador tiene un listado filtrado de ventas con `hasIssue: true`, sin funcionalidad adicional (no hay flujo de resolución/estado en esta versión — si hace falta más adelante, se agrega en una v1.1).

## Reportes necesarios

**Administrador únicamente**, todos con filtro de rango de fechas (diario/semanal/quincenal/mensual como atajos, más rango custom si es fácil de agregar):

- Ventas: diario (acumulándose en tiempo real), semanal, quincenal, mensual.
- Ingresos: mismos períodos que ventas (ver distinción arriba).
- Gastos: semanal, quincenal, mensual.
- Facturas: monto total pendiente vs. monto total pagado (no necesariamente por período, puede ser un total corriente).
- Cuentas corrientes: listado de cuentas con `balance > 0` (pendientes de cobro).
- Ventas con inconveniente: listado simple filtrado por `hasIssue: true`.

## Frontend — pantallas

### Panel Vendedor (después de login con el usuario compartido)
- Listado de productos (nombre, precio, categoría, disponibilidad) con buscador por nombre y filtro por categoría.
- Botón para marcar producto como NO DISPONIBLE / disponible de nuevo.
- Pantalla de carga de venta: agregar productos (cantidad o peso según `saleType`), ver total calculado en vivo, elegir método de pago, si es cuenta corriente elegir la persona.
- Poder marcar una venta reciente con un inconveniente (nota corta).

### Panel Administrador (login propio)
- Todo lo del panel vendedor, más:
- Reportes de ventas/ingresos/gastos (con selector de período).
- Carga y listado de gastos.
- Carga y listado de facturas, con botón para marcar como pagada.
- Listado de productos no disponibles.
- Gestión de cuentas corrientes: alta de cuenta nueva, ver detalle/cierre, marcar como pagada.
- Listado de ventas con inconveniente.

Mobile-first en ambos paneles — se siguen usando principalmente desde el celular.

## Manejo de errores

Mismo patrón de siempre: clase `AppError` (con `statusCode` y `isOperational`), middleware de error global al final de Express. Nunca exponer stack traces ni mensajes internos en producción.

## Qué NO hacer

- No generar tickets ni comprobantes imprimibles/exportables — todo queda en pantalla.
- No agregar control de cantidad de stock — solo el booleano `available`.
- No usar TypeScript.
- No dejar que el frontend calcule o mande el total de una venta — siempre lo calcula el backend.
- No borrar `CreditAccountItem` al saldar una cuenta — se archivan, nunca se eliminan.