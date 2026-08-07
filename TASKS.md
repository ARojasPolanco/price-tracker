# TASKS.md — Price Tracker

Leer `AGENTS.md` completo antes de empezar. Trabajar en orden, probando cada bloque antes de pasar al siguiente.

## 1. Setup del proyecto

- [ ] Estructura de carpetas: `backend/src/{config,models,controllers,routes,services,validations,middlewares}`, `frontend/src/{components,services}`.
- [ ] Backend: `npm init`, instalar `express`, `sequelize`, `pg`, `pg-hstore`, `zod`, `dotenv`, `cors`.
- [ ] Frontend: proyecto React con Vite + Tailwind.
- [ ] `docker-compose.yml` con Postgres local para desarrollo (mismo formato que uso en mis otros proyectos).

## 2. Backend — modelo y conexión

- [ ] `src/config/database.js`: conexión Sequelize, SSL condicional según entorno (sin SSL en Docker local, con SSL contra Render).
- [ ] Modelo `Product` (`name`, `price`) + migración.
- [ ] Seed opcional con 2-3 productos de ejemplo para probar mientras se desarrolla.

## 3. Backend — CRUD completo

- [ ] Validaciones Zod: crear producto, editar producto (name y/o price, ambos opcionales en edición pero al menos uno presente).
- [ ] Service con la lógica de: listar todos, buscar por nombre (`ILIKE` o equivalente, case-insensitive), crear, editar, eliminar.
- [ ] Controllers + rutas para los 5 endpoints definidos en `AGENTS.md`.
- [ ] Probar los 5 endpoints con curl/Postman antes de pasar al frontend.

## 4. Frontend

- [ ] Pantalla única: buscador + listado + formulario de alta.
- [ ] Conectar a la API (fetch/axios) para los 5 endpoints.
- [ ] Confirmar antes de eliminar (un simple `confirm()` o modal chico, para que no se borre un producto por error desde el celular).
- [ ] Diseño mobile-first con Tailwind: botones grandes, tipografía legible, sin elementos que requieran scroll horizontal.

## 5. Despliegue

- [ ] Backend + Postgres en Render (plan free).
- [ ] Frontend en Vercel (plan free), apuntando a la URL del backend.
- [ ] Probar el flujo completo desde un celular real antes de darlo por terminado.

**Criterio de éxito:** se puede agregar, buscar, editar y eliminar un producto desde el celular, sin login, sin errores.
