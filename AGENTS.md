<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# GUÍA DE ARQUITECTURA Y ESTÁNDARES: NAVIDAD DAVID

Este documento es la **fuente oficial de verdad** del proyecto **Navidad David**. Cualquier agente o desarrollador que trabaje en esta base de código debe respetar estrictamente los principios, patrones arquitectónicos y reglas aquí detallados.

---

## 1. Visión y Stack Tecnológico

* **Framework Web**: Next.js 16.4.2 (App Router con Turbopack & Cache Components).
* **Librería UI**: React 19.3.0.
* **Base de Datos**: PostgreSQL normalizada según las **12 Reglas de Codd**.
* **ORM**: Prisma ORM 6.19.3 con nombrado estricto de tablas `tb_*` y atributos en español.
* **Procesamiento de Medios**: Sharp (compresión WebP desacoplada fuera de Git).
* **Validación de Datos**: ZOD (tipado estricto en tiempo de ejecución en controladores).
* **Seguridad & Sesión**: JWT firmado con `NEXTAUTH_SECRET`, Cookie HttpOnly `barber_tech_session` y 2FA obligatorio por SMTP (Google Mail).
* **Pasarela de Pago**: Bold (PSE y Tarjetas de Crédito/Débito) con firma criptográfica HMAC-SHA256 e idempotencia.

---

## 2. Arquitectura del Proyecto (Clean Architecture & SOLID)

El proyecto sigue una estricta separación de responsabilidades en 4 capas:

```plaintext
navidad_david/
├── prisma/
│   ├── schema.prisma              # Esquema relacional con 10 tablas tb_* documentadas
│   └── seed.ts                    # Semilla con usuarios, catálogo de 14 productos y órdenes
├── public/
│   ├── Logo_david.png             # Logo oficial en alta resolución (1280x1276 px)
│   ├── Logo_david.webp            # Versión WebP optimizada
│   └── img/                       # Fotografías de categorías y catálogo WebP
├── storage/
│   └── binaries/products/         # Binarios WebP fuera de Git (.gitignore)
├── src/
│   ├── app/                       # Capa de Enrutamiento (Next.js 16 App Router)
│   │   ├── (store)/               # Tienda pública (Navbar, Hero, Categorías, Grilla, Carrito)
│   │   ├── admin/                 # Panel de Control Administrativo protegido con 2FA
│   │   └── api/                   # Rutas de API delgadas (5-15 líneas)
│   ├── backend/                   # Capa de Dominio, Aplicación y Persistencia
│   │   ├── config/prisma.ts       # Cliente Prisma singleton
│   │   ├── shared/                # Utilidades transversales (apiResponse, getSessionUser)
│   │   └── modules/               # Módulos desacoplados del sistema
│   │       ├── auth/              # Controladores, servicios, repositorios y 2FA
│   │       ├── catalog/           # Secciones dinámicas, productos y binarios WebP
│   │       ├── customers/         # Directorio e historial de clientes únicos por email
│   │       ├── orders/            # Checkout sin registro, Bold gateway y webhooks
│   │       └── analytics/         # KPIs de ventas, cliente más frecuente y filtro de fechas
│   ├── frontend/                  # Capa de Presentación (UX / UI)
│   │   ├── components/            # ProductCard, ProductDetailModal, SearchModal, etc.
│   │   ├── context/               # CartContext
│   │   └── modules/               # StorefrontView y AdminDashboardView
│   └── types/                     # Interfaces TypeScript del dominio
```

---

## 3. Reglas Estrictas de las Rutas de la API (`src/app/api/...`)

> [!IMPORTANT]
> **Las rutas en `src/app/api/...` NUNCA deben contener lógica de negocio, queries directas de Prisma ni validaciones manuales.**

Cada archivo `route.ts` debe ser un delegado delgado que instancia el controlador del módulo y reenvía la petición:

```typescript
// Ejemplo: src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { AuthController } from '@/backend/modules/auth/auth.controller';

const controller = new AuthController();

export async function POST(req: NextRequest) {
  return controller.login(req);
}
```

### Anatomía de un Módulo del Backend (`src/backend/modules/<modulo>/`)

Cada módulo debe contar con la siguiente estructura:
1. `*.validator.ts`: Esquemas Zod para validar `body` o `query` con `safeParse`.
2. `*.controller.ts`: Recibe `NextRequest`, valida con Zod, invoca el servicio y responde con `apiResponse()`.
3. `*.service.ts`: Reglas de negocio puras, criptografía, hashing, despacho SMTP o integración externa.
4. `*.repository.ts`: Interacción exclusiva con Prisma ORM sobre las tablas `tb_*`.

---

## 4. Autenticación, JWT, Cookies y Manejo de Contraseñas

### Variables de Entorno Requeridas (.env)
```env
AUTH_COOKIE_NAME=barber_tech_session
AUTH_SESSION_HOURS=4
NEXTAUTH_SECRET="c4@fwiuso=a)2xkw5+)4+j0&$bs2=)0$%%8r+@4dfpx$p_rv$q"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="barbertechhelp@gmail.com"
SMTP_PASS="pdum vvol tttb qcij"
SMTP_FROM="Soporte Barber Tech <barber_tech_help@gmail.com>"
```

### Reglas de Seguridad Críticas:
1. **Firma de Tokens**: Todos los tokens JWT deben firmarse con `NEXTAUTH_SECRET` y expirar en `${AUTH_SESSION_HOURS}h`.
2. **Cookie HttpOnly**: La cookie `barber_tech_session` se configura con `httpOnly: true`, `secure: true` (en producción), `sameSite: "lax"`, y `maxAge: AUTH_SESSION_HOURS * 3600`.
3. **Manejo Resiliente de Contraseñas (Auto-Hash)**:
   * Si un administrador o DBA actualiza manualmente una contraseña en `tb_users.contrasena_hash` en texto plano (ej: `Admin123`), `AuthService.verifyPassword` detecta la coincidencia plana.
   * Al iniciar sesión con éxito, el sistema **convierte automáticamente** la clave plana a un hash PBKDF2 (`salt:hash`) y actualiza la base de datos de inmediato.
4. **Flujo de 2FA**:
   * Al ingresar usuario y clave válidos, si `activacion_2fa = true`, se genera un código de 6 dígitos con validez de 5 minutos y se envía exclusivamente al correo por SMTP.
   * **NUNCA** retornar el código 2FA en la respuesta JSON ni autollenarlo en el formulario del frontend.

---

## 5. Diseño del Frontend (Mobile-First UX/UI Inspirado en Nana.col)

El smartphone es el **dispositivo principal** de los clientes y administradores. Toda la interfaz debe respetar estrictamente:
* **Viewport Oficial**: Configurado en `src/app/layout.tsx` con `width=device-width, initial-scale=1, maximum-scale=5`.
* **Navbar Móvil ([Navbar.tsx](file:///src/frontend/modules/store/components/Navbar.tsx))**: Altura compacta `h-16`, ribbon superior optimizado, botón hamburguesa con drawer táctil desplegable, buscador predictivo y carrito accesible con el pulgar.
* **Barra de Secciones Sticky ([DynamicSectionBar.tsx](file:///src/frontend/modules/store/components/DynamicSectionBar.tsx))**: Anclada con `top-[64px] sm:top-24` para no tapar contenido en teléfonos, con scroll horizontal fluido y sin barras de desplazamiento intrusivas.
* **Grilla de Catálogo Móvil ([DynamicSectionGrid.tsx](file:///src/frontend/modules/store/components/DynamicSectionGrid.tsx))**: Grilla de **2 columnas en teléfonos móviles** (`grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6`), permitiendo ver pares de árboles sin scroll excesivo.
* **Tarjetas de Producto ([ProductCard.tsx](file:///src/frontend/components/ProductCard.tsx))**:
  * Proporción vertical **3:4** con badges compactos.
  * Selector interactivo de altura en formato chip que no desborda la tarjeta.
  * Botón "Agregar" táctil y botón directo a WhatsApp.
  * Al tocar la tarjeta o foto, abre inmediatamente el modal de detalle rápido.
* **Modal de Detalle Táctil ([ProductDetailModal.tsx](file:///src/frontend/components/ProductDetailModal.tsx))**:
  * Diseño tipo Bottom-Sheet en móvil (`rounded-t-[32px] sm:rounded-3xl`).
  * Galería cuadrada compacta (`aspect-square max-h-56`) para dejar espacio visible a los precios y variantes.
  * **Barra de compra sticky** fija en la parte inferior de la pantalla para compra en 1 toque.
* **Formularios & Prevención de Auto-Zoom iOS ([GuestCheckoutModal.tsx](file:///src/frontend/components/GuestCheckoutModal.tsx))**: Todos los inputs usan tamaño de fuente mínimo de 16px (`text-base sm:text-sm`) para evitar que Safari en iPhone haga zoom involuntario al enfocar campos.
* **Panel de Control Administrativo ([AdminDashboardView.tsx](file:///src/frontend/modules/admin/AdminDashboardView.tsx) & [AdminSidebar.tsx](file:///src/frontend/modules/admin/components/AdminSidebar.tsx))**: Header móvil con botón hamburguesa y sidebar deslizable (off-canvas drawer) con backdrop, permitiendo gestionar ventas y productos con total comodidad desde el celular.

---

## 6. Errores Críticos que se Deben Evitar

> [!CAUTION]
> 1. **NO** versionar binarios pesados en Git. Todo archivo `.webp` de producto debe residir en `storage/binaries/` (ignorado en `.gitignore`).
> 2. **NO** exponer códigos 2FA ni en el cuerpo de la respuesta HTTP ni en el estado de React.
> 3. **NO** usar `export const dynamic = 'force-dynamic'` en páginas bloqueantes cuando `cacheComponents: true` esté activo en `next.config.ts`. Usar Server Components o `export const instant = false`.
> 4. **NO** desnormalizar imágenes o variantes en campos `String[]` o `JSON`. Cumplir las 12 Reglas de Codd mediante tablas relacionales `tb_*`.
> 5. **NO** eludir la validación con Zod en los controladores del backend.
> 6. **NO** usar UUID para productos, imágenes o catálogo. ÚNICAMENTE `tb_users` debe usar `UUID`. Las otras 9 tablas deben usar claves numéricas enteras autoincrementables (`Int @id @default(autoincrement())`).
> 7. **NO** comitear migraciones de Prisma al repositorio Git (deben estar en `.gitignore`).

---

## 7. Identificadores y Claves Primarias

* **Tabla `tb_users`**: Clave primaria tipo `UUID` (`id String @id @default(uuid()) @db.Uuid`) para garantizar unicidad global y seguridad contra enumeración en autenticación.
* **Tablas de Catálogo, Órdenes y Clientes**: Clave primaria tipo `INTEGER` autoincremental (`Int @id @default(autoincrement())`) y llaves foráneas enteras (`@db.Integer`) para simplificar la identificación, optimizar índices y hacer amigable la consulta de productos (ej: ID 1, 2, 3...) y fotos.

---

## 8. Migraciones de Base de Datos y Verificación CLI (PostgreSQL & psql)

### Conexión Directa por CLI (`psql`)
* **Binario oficial (Windows)**: `C:\Program Files\PostgreSQL\18\bin\psql.exe`
* **Credenciales locales de desarrollo**:
  * **Usuario**: `postgres`
  * **Contraseña**: `admin123`
  * **Base de datos**: `navidad_david`
  * **Host/Puerto**: `localhost:5432`
* **Comandos rápidos en PowerShell**:
  ```powershell
  # Establecer credencial en sesión
  $env:PGPASSWORD="admin123"

  # Ingresar a la consola interactiva psql
  & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d navidad_david

  # Listar todas las tablas
  & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d navidad_david -c "\dt"

  # Verificar estructura de productos (id entero) y usuarios (id UUID)
  & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d navidad_david -c "\d tb_productos"
  & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d navidad_david -c "\d tb_users"
  ```

### Flujo Oficial de Migraciones y Semilla
1. **Ejecutar migraciones en desarrollo**:
   ```powershell
   npx prisma migrate dev --name <nombre_descriptivo>
   ```
2. **Siembra de Catálogo y Usuarios (`seed.ts`)**:
   ```powershell
   npm run db:seed
   ```
   * Administrador Principal: `sebastiansanchez1236@gmail.com` | Clave: `Admin123` | 2FA: Activo.
   * Administrador Secundario: `admin@navidaddavid.com` | Clave: `NavidadDavid2026*` | 2FA: Activo.
   * Catálogo completo: 3 Secciones, 14 Productos, Variantes de altura e Imágenes WebP.
3. **Regla de Exclusión Git**:
   * Las carpetas `prisma/migrations/` están listadas en `.gitignore`.
   * **NUNCA** subir archivos de migración SQL al repositorio Git.

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
