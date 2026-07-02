# LC Consulting OS

Aplicacion web interna para administrar el flujo completo de LC Consulting: CRM, clientes, diagnosticos, recetario, proyectos, Gantt, tareas, KPIs, reuniones, entregables y reportes.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready: Auth, Postgres, RLS, roles y datos demo SQL

## Correr localmente

```bash
pnpm install
pnpm dev
```

Abrir `http://127.0.0.1:3000`.

## Accesos demo

La app funciona en modo demo local sin Supabase. Usa cualquiera:

- `admin@lcconsulting.mx`
- `consultor@lcconsulting.mx`
- `viewer@lcconsulting.mx`

La contrasena visible en pantalla es demo.

## Supabase

1. Crear un proyecto en Supabase.
2. Copiar `.env.example` a `.env.local`.
3. Llenar:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

4. Ejecutar en SQL Editor:

```sql
-- supabase/schema.sql
-- supabase/lc_ops_delta.sql
-- supabase/seed.sql
```

El esquema incluye las tablas pedidas, relaciones, roles `admin`, `consultant`, `viewer`, multiusuario por organizacion y RLS para datos por organizacion.

## Scripts

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Siguiente fase sugerida

- Conectar los formularios del UI al repositorio Supabase real.
- Agregar Storage para archivos.
- Exportacion PDF de reportes.
- Integraciones Google Calendar/Gmail.
- Generacion asistida por IA para diagnosticos y recetas.
