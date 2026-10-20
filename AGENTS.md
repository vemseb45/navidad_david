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

## 5. Diseño del Frontend (Inspirado en Nana.col)

* **Hero Section ([Hero.tsx](file:///src/frontend/modules/store/components/Hero.tsx))**: Fondo fotográfico navideño con viñeta ambiental verde pino (`#002718`), cápsula dorada (`#ffe088`) y tipografía serif.
* **Pilares de Marca ([FeaturesBanner.tsx](file:///src/frontend/modules/store/components/FeaturesBanner.tsx))**: 4 pilares en grilla responsive (2 columnas en móviles, 4 en desktop).
* **Categorías ([Categories.tsx](file:///src/frontend/modules/store/components/Categories.tsx))**: Tarjetas con curvaturas orgánicas (`rounded-[40%_60%...]`), hover zoom y navegación por anclas.
* **Tarjetas de Producto ([ProductCard.tsx](file:///src/frontend/components/ProductCard.tsx))**:
  * Proporción vertical **3:4**.
  * Hover que alterna a la fotografía secundaria (árbol encendido o detalle).
  * Selector interactivo de altura (1.80m, 2.10m, 2.40m) que actualiza el precio en tiempo real.
  * Botón flotante "Ver Detalle Rápido" y botón directo a WhatsApp.
* **Modal de Detalle ([ProductDetailModal.tsx](file:///src/frontend/components/ProductDetailModal.tsx))**: Visor interactivo con zoom al cursor, selector de variantes, compra directa Bold y WhatsApp.

---

## 6. Errores Críticos que se Deben Evitar

> [!CAUTION]
> 1. **NO** versionar binarios pesados en Git. Todo archivo `.webp` de producto debe residir en `storage/binaries/` (ignorado en `.gitignore`).
> 2. **NO** exponer códigos 2FA ni en el cuerpo de la respuesta HTTP ni en el estado de React.
> 3. **NO** usar `export const dynamic = 'force-dynamic'` en páginas bloqueantes cuando `cacheComponents: true` esté activo en `next.config.ts`. Usar Server Components o `export const instant = false`.
> 4. **NO** desnormalizar imágenes o variantes en campos `String[]` o `JSON`. Cumplir las 12 Reglas de Codd mediante tablas relacionales `tb_*`.
> 5. **NO** eludir la validación con Zod en los controladores del backend.
