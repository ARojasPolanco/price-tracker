# AGENTS.md — Price Tracker (CRUD simple de productos y precios)

## Contexto

Herramienta simple para que una comerciante deje de memorizar precios. Un solo usuario, sin login, uso desde el celular. Si le resulta útil, puede evolucionar a algo más grande — pero la versión actual tiene que ser lo más liviana posible, sin sobre-ingeniería.

## Stack (igual al resto de mis proyectos)

- JavaScript puro (sin TypeScript).
- Backend: Node.js + Express.
- Validación: Zod.
- ORM: Sequelize sobre PostgreSQL.
- Frontend: React + Tailwind CSS.
- Sin autenticación — todas las rutas son públicas, no hay concepto de usuario/rol.

## Arquitectura

Mismo patrón de siempre: `Route → Controller → Service → Model`, con validación Zod en cada endpoint que recibe datos. Nada de lógica de negocio en controllers ni en rutas.

## Modelo de datos

Un solo modelo, `Product`:
- `id` (autoincremental)
- `name` (string, obligatorio)
- `price` (decimal, obligatorio, positivo)
- timestamps (`createdAt`, `updatedAt`)

No hace falta stock, categoría, imagen ni ningún otro campo — mantenerlo mínimo.

## Endpoints necesarios

- `GET /api/products` — lista todos los productos.
- `GET /api/products?search=<texto>` — filtra por nombre (búsqueda parcial, case-insensitive).
- `POST /api/products` — crea un producto (`name`, `price`).
- `PUT /api/products/:id` — edita nombre y/o precio.
- `DELETE /api/products/:id` — elimina un producto.

## Frontend

Una sola pantalla (no hace falta ruteo/páginas múltiples):
- Buscador arriba (filtra en vivo o con botón, a elección del agente).
- Listado de productos con nombre y precio, y botones editar/eliminar en cada fila.
- Formulario simple para agregar producto nuevo (puede ser un modal o una sección fija arriba/abajo del listado).
- Diseño mobile-first: se va a usar desde el celular, priorizar que los botones sean fáciles de tocar y que no haga falta zoom.

## Despliegue

- Backend + Postgres: Render (plan free), mismo proceso que ya usé en otros proyectos.
- Frontend: Vercel (plan free).
- No hace falta entorno dual local/producción complejo — un solo `.env` para desarrollo local con Docker, y las variables de entorno cargadas directo en Render para producción.

## Manejo de errores

Mismo patrón de siempre: una clase `AppError` (con `statusCode` y `isOperational`) que se lanza desde los services, y un middleware de error global al final de Express que la captura. En producción, nunca exponer stack traces ni mensajes internos al cliente — solo un mensaje claro y el código de estado correcto (404 si no existe el producto, 400 si la validación falla, etc.).

## Reglas de Git (mismas que siempre)

- No ejecutar `git init` si ya existe un repo — nunca reinicializar sin confirmación.
- No ejecutar comandos destructivos de Git sin mostrar el comando antes y esperar confirmación.

## Qué NO hacer

- No agregar autenticación, roles, ni multi-usuario — está fuera de alcance de esta versión.
- No usar TypeScript.
- No agregar campos al modelo que no estén pedidos acá.
