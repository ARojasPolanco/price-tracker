# TASKS.md — Expansión MVP v1.0

Leer `AGENTS.md` completo antes de empezar (fue reescrito para esta versión, releerlo aunque ya se haya leído antes). Trabajar en orden, probando cada fase antes de pasar a la siguiente. Parar y preguntar ante cualquier ambigüedad de negocio que no esté resuelta en `AGENTS.md`.

**Flujo de Git por fase (obligatorio, repetir en cada fase de abajo):**
1. Crear rama `feature/<acción-de-la-fase>` desde `dev`.
2. Hacer el trabajo de la fase y probarlo.
3. `git add .`
4. `git commit -m "..."` con Conventional/Semantic Commits.
5. Mergear la rama `feature/` a `dev` (local).
6. `git push origin dev`.
7. **Nunca mergear a `main`** — eso lo hace el usuario manualmente.

---

## FASE 1 — Autenticación y roles

- [ ] Modelo `User`: `username`, `passwordHash`, `role` (`'vendedor' | 'administrador'`).
- [ ] Migración + seed con los dos usuarios (uno por rol). Las contraseñas del seed deben venir de variables de entorno, no hardcodeadas en el código.
- [ ] Endpoints: `POST /api/auth/login`, middleware de verificación de JWT, middleware de verificación de rol (`requireRole('administrador')`).
- [ ] Frontend: pantalla de login única, redirige a panel Vendedor o Administrador según el rol del token.
- [ ] Probar: login con cada usuario, acceso denegado a rutas de admin con el usuario vendedor.

**Criterio de éxito:** ambos logins funcionan, las rutas de administrador rechazan al usuario vendedor con 403.

---

## FASE 2 — Categorías y actualización de Producto

- [ ] Modelo `Category` + migración + CRUD básico (solo administrador puede crear/editar/borrar categorías).
- [ ] Migración de `Product`: agregar `categoryId`, `saleType` (`'unidad' | 'kilo'`), `available`.
- [ ] Actualizar validaciones Zod de producto para incluir los campos nuevos.
- [ ] Frontend: selector de categoría al cargar/editar producto, filtro por categoría en el listado, botón de marcar disponible/no disponible.
- [ ] Probar: crear producto por unidad y por kilo, filtrar por categoría, marcar no disponible y confirmar que aparece en el listado de "no disponibles" del admin.

**Criterio de éxito:** productos con categoría y tipo de venta funcionando, filtro por categoría operativo.

---

## FASE 3 — Cuentas corrientes (solo estructura, todavía sin ventas)

- [ ] Modelo `CreditAccount` (`name`, `balance`).
- [ ] Modelo `CreditAccountItem` (`creditAccountId`, `saleId`, `amount`, `date`, `archived`, `settledAt`).
- [ ] Endpoints (solo administrador): crear cuenta, listar cuentas, ver detalle de una cuenta.
- [ ] Frontend admin: alta de cuenta corriente nueva, listado de cuentas.

**Criterio de éxito:** el admin puede crear una cuenta corriente y verla en un listado. Todavía no hay ventas asociadas (eso es la Fase 4).

---

## FASE 4 — Carga de ventas

- [ ] Modelos `Sale` y `SaleItem` según `AGENTS.md`.
- [ ] Service de creación de venta: recibe lista de `{ productId, quantity }`, busca el precio actual del producto (`unitPriceAtSale` = snapshot), calcula `subtotal` por ítem y `total` de la venta en el backend — nunca confiar en un total que mande el frontend.
- [ ] Validación: si `paymentMethod === 'CUENTA_CORRIENTE'`, `creditAccountId` es obligatorio; si no, no debe mandarse.
- [ ] Si es cuenta corriente: además de crear la `Sale`, crear el `CreditAccountItem` correspondiente y sumar al `balance` de la cuenta.
- [ ] Frontend (panel vendedor): pantalla de carga de venta — agregar productos con cantidad/peso según corresponda, ver total en vivo, elegir método de pago, selector de cuenta corriente si aplica.
- [ ] Probar los 4 métodos de pago, incluyendo que una venta a cuenta corriente efectivamente sume el `balance` de la cuenta elegida.

**Criterio de éxito:** se puede cargar una venta completa desde el panel vendedor, con cualquier método de pago, y el total calculado coincide con lo esperado.

---

## FASE 5 — Cierre y pago de cuentas corrientes

- [ ] Endpoint de "generar cierre" (solo lectura): devuelve `balance` + detalle de `CreditAccountItem` activos de una cuenta.
- [ ] Endpoint de "marcar como pagada": archiva los ítems activos (`archived: true`, `settledAt: now`), resetea `balance` a 0, registra el ingreso del día (ver Fase 7 para cómo se refleja esto en reportes).
- [ ] Frontend admin: pantalla de detalle de cuenta corriente con el desglose, botón de cierre/pago con confirmación (para evitar un click accidental que resetee un saldo).
- [ ] Probar: que después de marcar pagada, el balance quede en 0, los ítems sigan consultables (archivados), y se pueda repetir el ciclo (cargar nuevas ventas a la misma cuenta después de saldada).

**Criterio de éxito:** el ciclo completo de fiar → cerrar → pagar → volver a fiar funciona sin perder historial.

---

## FASE 6 — Gastos y Facturas

- [ ] Modelo `Expense` (gasto informal) + CRUD (solo administrador).
- [ ] Modelo `Invoice` (factura de proveedor) + CRUD (solo administrador), `status` default `'PENDIENTE'`.
- [ ] Endpoint para cambiar `Invoice.status` a `'PAGADA'` (completa `paidAt`).
- [ ] Frontend admin: pantalla de gastos (listado + alta), pantalla de facturas (listado + alta + botón "marcar pagada"), con los montos pendiente/pagado mostrados por separado.
- [ ] Probar: cargar un gasto informal, cargar una factura, marcarla pagada, confirmar que los totales pendiente/pagado se actualizan bien.

**Criterio de éxito:** gastos y facturas se cargan y gestionan de forma independiente, con los estados correctos.

---

## FASE 7 — Reportes

- [ ] Reporte de Ventas (diario/semanal/quincenal/mensual): suma de `Sale.total` agrupado por fecha de la venta, sin importar método de pago.
- [ ] Reporte de Ingresos (mismos períodos): suma de ventas en `EFECTIVO`/`MERCADO_PAGO`/`CUENTA_DNI` por fecha de venta, **más** cierres de cuenta corriente por fecha de `settledAt`.
- [ ] Reporte de Gastos (semanal/quincenal/mensual): suma de `Expense` por fecha.
- [ ] Reporte de Facturas: total `PENDIENTE` vs. total `PAGADA`.
- [ ] Reporte de Cuentas corrientes pendientes: listado de `CreditAccount` con `balance > 0`.
- [ ] Frontend admin: pantalla de reportes con selector de período para cada uno.
- [ ] Probar cada reporte con datos de prueba cargados en las fases anteriores, confirmando que los números cierran a mano.

**Criterio de éxito:** los 5 reportes muestran números correctos y verificables con los datos de prueba cargados.

---

## FASE 8 — Reporte de inconvenientes (versión simple)

- [ ] Agregar `hasIssue` e `issueNote` a `Sale` (si no se hizo ya en Fase 4).
- [ ] Endpoint para marcar una venta existente con inconveniente (vendedor).
- [ ] Endpoint de listado filtrado por `hasIssue: true` (admin).
- [ ] Frontend: botón simple en el panel vendedor para marcar una venta reciente, listado en el panel admin.

**Criterio de éxito:** se puede marcar una venta con un problema y verla listada del lado del admin.

---

## FASE 9 — Integración final en Docker

- [ ] Revisar que todas las rutas de administrador estén correctamente protegidas por rol.
- [ ] Levantar todo con Docker simulando producción (como se hizo con el MVP simple) y probar el flujo completo de punta a punta: login vendedor → cargar venta → login admin → ver reportes → cerrar cuenta corriente → cargar factura → marcarla pagada.
- [ ] Confirmar que todos los scripts de testeo de todas las fases (1 a 8) pasan corriéndolos de nuevo, uno por uno, contra el estado final.

**Criterio de éxito:** el flujo completo funciona en Docker local sin errores. **El merge a `main` y la verificación en producción los hace el usuario manualmente — no son tarea del agente.**

---

## Scripts de testeo por fase

Al completar cada fase (antes de pasar a la siguiente), crear un script Node independiente que pegue a los endpoints de esa fase con datos de prueba y muestre los resultados por consola (igual que se hizo en PharmBot). No usar un framework de testing — son scripts manuales de verificación rápida, no una suite automatizada.

- Ubicación: `backend/scripts/tests/`
- Un archivo por fase, numerado: `fase1-auth.js`, `fase2-productos.js`, `fase3-cuentas-corrientes.js`, `fase4-ventas.js`, `fase5-cierre-cuenta-corriente.js`, `fase6-gastos-facturas.js`, `fase7-reportes.js`, `fase8-inconvenientes.js`.
- Cada script debe probar **varios casos de éxito y varios casos de error** de esa fase (no uno solo de cada). Ejemplos de casos de error a cubrir según la fase: login con credenciales inválidas, acceso a ruta de admin con rol de vendedor, crear un producto sin nombre o con precio negativo, venta a cuenta corriente sin `creditAccountId`, marcar pagada una cuenta corriente inexistente, etc.
- Para cada caso, el script debe **verificar explícitamente que el resultado sea el esperado** — no alcanza con que el endpoint devuelva algún error, hay que chequear que sea el código de estado y el tipo de error correctos (ej. 401 para credenciales inválidas, 403 para rol incorrecto, 400 para validación fallida). Si el resultado no coincide con lo esperado, el script debe marcarlo claramente como FALLIDO en la consola, no solo mostrar la respuesta cruda.
- Se corren manualmente con `node backend/scripts/tests/fase1-auth.js`, contra la base local de Docker — no se integran a ningún pipeline automático por ahora.
- No borrar los scripts de fases anteriores al avanzar — quedan como forma rápida de re-verificar que nada se rompió, se pueden volver a correr en cualquier momento.