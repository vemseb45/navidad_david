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
│   ├── proxy.ts                   # Proxy de Seguridad Next.js 16 (Cabeceras OWASP, CSRF, Cookie/JWT Auth)
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
5. **Proxy de Seguridad Next.js 16 (`src/proxy.ts`)**:
   * En Next.js 16, la convención `middleware.ts` fue renombrada a `proxy.ts` y corre por defecto sobre el runtime de Node.js.
   * Ubicación oficial: `src/proxy.ts` (al mismo nivel que `src/app`).
   * Aplica cabeceras de seguridad OWASP Defense-in-Depth (`Content-Security-Policy`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-XSS-Protection`, `Strict-Transport-Security`).
   * Protege rutas administrativas de API (`/api/admin/*`, `/api/auth/users/*`) validando la cookie HttpOnly `barber_tech_session` y firma JWT con `NEXTAUTH_SECRET`.
   * Bloquea ataques CSRF en métodos de mutación (`POST`, `PUT`, `DELETE`, `PATCH`) comparando el Origin del cliente contra el Host (eximiendo webhooks de pasarelas como `/api/webhooks/bold`).
   * Inyecta `x-request-id` único para trazabilidad y propaga datos de sesión autenticada (`x-user-id`, `x-user-role`, `x-user-email`) hacia los controladores.
   * Si la cookie de sesión está corrupta o expiró, responde 401 y la limpia automáticamente con `Set-Cookie: Max-Age=0`.

---

## 5. Diseño del Frontend (Mobile-First UX/UI Inspirado en Nana.col y Dark Luxury)

El smartphone es el **dispositivo principal** de los clientes y administradores. Toda la interfaz debe respetar estrictamente:
* **Viewport Oficial**: Configurado en `src/app/layout.tsx` con `width=device-width, initial-scale=1, maximum-scale=5`.
* **Marco Superior y Hero Comercial ([CommercialHero.tsx](file:///src/frontend/modules/store/components/CommercialHero.tsx))**: Banner fotográfico familiar festivo en alta resolución (`hero_familia.png`/`.webp`), logo corporativo `Logo_david_original.png` (enlace de acceso al panel administrativo), barra de navegación fija persistente al desplazarse (`fixed top-0 inset-x-0 z-50` con backdrop blur `#121417`), 6 enlaces principales de navegación y botón de carrito de compras glass-pill con badge de conteo (barra de búsqueda e icono de usuario eliminados para mantener un diseño equilibrado, limpio y sin espacios vacíos).
* **Calculador de Espacio ([HeightGuideSection.tsx](file:///src/frontend/modules/store/components/HeightGuideSection.tsx))**: Selector interactivo de alturas (`1.80m`, `2.10m`, `2.40m`) para adecuar el árbol a los techos residenciales estándar de Colombia.
* **Colección Dos Tradiciones ([CollectionSection.tsx](file:///src/frontend/modules/store/components/CollectionSection.tsx))**: Segmentación interactiva entre Pinos Tradicionales Canadienses (`arbol_tradicional.png`) y Árboles con Fibra Óptica Micro-LED (`arbol_fibra.png`). Grilla responsive (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6`). Botones "Comprar" estrictamente blancos (`bg-white text-stone-950`) que disparan la animación festiva de monedas del reno de Santa Claus (`shootChristmasCoins`) hacia el carrito sin redirigir a WhatsApp.
* **Tarjetas de Producto ([ProductCard.tsx](file:///src/frontend/components/ProductCard.tsx))**:
  * Proporción vertical **3:4** con badges compactos.
  * Selector interactivo de altura en formato chip que no desborda la tarjeta.
  * Botón "Agregar" táctil y botón directo a WhatsApp.
  * Al tocar la tarjeta o foto, abre inmediatamente el modal de detalle rápido.
* **Carrito Desplegable ([CartDrawer.tsx](file:///src/frontend/components/CartDrawer.tsx))**:
  * Diseño Dark Luxury en `#16181c` con bordes `border-white/10` y tarjetas `glass-card`.
  * Barra de progreso de envío gratis (meta: $150.000 COP).
  * **REGLA ESTRICTA**: Prohibido incluir textos de impuestos ni recargos ("Impuestos y costos de envío (si aplican) calculados al checkout").
  * **Botón Oficial**: Botón de alta gama en oro `brand-gold` con texto estrictamente **"Pagar"** (sin frases largas como "Proceder al Pago Seguro (Sin Registro)").
* **Modal de Detalle Táctil ([ProductDetailModal.tsx](file:///src/frontend/components/ProductDetailModal.tsx)):**
  * Diseño Dark Luxury en `#16181c` tipo Bottom-Sheet en móvil (`rounded-t-[28px] sm:rounded-3xl`).
  * Visor de zoom interactivo en imagen con miniaturas seleccionables en anillo dorado.
  * Selector de variantes de altura en chips dorados y botones de acción rápida ("Agregar" y "Comprar").
  * **Botón "Comprar" Blanco & Animación Navideña**: Botón "Comprar" estrictamente en blanco (`bg-white text-stone-950`). Tanto "Agregar" como "Comprar" activan la animación de monedas doradas con el reno de Santa Claus (`shootChristmasCoins`) que vuelan hacia el carrito; "Comprar" dirige al carrito y abre de inmediato la orden.
* **Animación de Monedas Festivas del Reno de Santa Claus ([christmasCoins.ts](file:///src/frontend/shared/christmasCoins.ts))**:
  * Motor nativo con Web Animations API (60fps, aceleración GPU).
  * Monedas doradas festivas con silueta del reno de Santa Claus y nariz roja resplandeciente de Rodolfo.
  * Trayectoria parabólica ascendente hacia `#header-cart-button` con rebote elástico y destello estelar ✨ al impactar.
* **Modal de Búsqueda Predictiva ([SearchModal.tsx](file:///src/frontend/components/SearchModal.tsx))**:
  * Interfaz modal en `#16181c` con búsqueda instantánea por SKU, estilo y nombre de árbol.
  * Navegación fluida y enlaces directos al visor de detalle rápido.
* **Formularios & Prevención de Auto-Zoom iOS ([GuestCheckoutModal.tsx](file:///src/frontend/components/GuestCheckoutModal.tsx))**: Todos los inputs usan tamaño de fuente mínimo de 16px (`text-base sm:text-sm`) para evitar que Safari en iPhone haga zoom involuntario al enfocar campos.
* **Botón Flotante Oficial de WhatsApp ([WhatsAppFloatingButton.tsx](file:///src/frontend/components/WhatsAppFloatingButton.tsx))**:
  * Diseño estrictamente circular (`rounded-full w-12 h-12 sm:w-14 sm:h-14`) para optimizar el viewport táctil.
  * Icono vectorial oficial de WhatsApp sobre fondo `#25D366` con aro `ring-4 ring-black/40` y punto pulsante esmeralda.
  * **REGLA ESTRICTA**: Prohibido añadir etiquetas o pastillas de texto alargadas ("Asesoría Navidad David") que reduzcan el espacio de visualización en smartphones.
* **Composición y Encuadre del Hero en Smartphones**:
  * Altura responsiva (`min-h-[640px] sm:min-h-[720px] md:min-h-[780px] lg:h-[840px]`) que previene el zoom desmedido (3.6x) al proyectar fotos panorámicas 16:9 en pantallas móviles verticales.
  * Foco centralizado (`object-[center_32%] md:object-center`) para destacar siempre el árbol y la escena familiar.
  * Gradiente móvil despejado (`bg-gradient-to-b from-black/75 via-transparent via-45% to-[#090a0d]/90`), suprimiendo la sombra lateral negra en móviles para permitir que las fotos luzcan brillantes y nítidas.
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
> 8. **NO** incluir textos o referencias a impuestos ("Impuestos y costos de envío (si aplican) calculados al checkout") en el carrito ni en modales.
> 9. **NO** usar textos largos o redundantes en el botón de pago del carrito; debe decir estrictamente **"Pagar"** con estética minimalista.
> 10. **NO** mezclar fondos blancos o tarjetas claras que desentonen con la estética Dark Luxury (`#121417`, `#16181c`, `brand-gold: #E5B869`).
> 11. **NO** renderizar imágenes duplicadas o genéricas sin relación con árboles en la tienda pública. Emplear exclusivamente los activos oficiales: `hero_familia.png`/`.webp` (imagen principal del Hero), `hero_familia_2.png`/`.webp`, `hero_familia_3.png`/`.webp`, `hero_familia_4.png`/`.webp` (carrusel interactivo de 3 estilos), `arbol_tradicional.png`/`.webp`, `arbol_fibra.png`/`.webp` y `Logo_david_original.png`.
> 12. **NO** mostrar badges invasivos ('Activo', 'Más vendido', 'Micro-LED', 'Nieve Realista') sobre las fotos de los recuadros ni contadores numéricos (ej. `01 / 04`, `02 / 04`) en el carrusel del Hero. El cliente percibe una experiencia visual limpia y fotográfica de las 3 colecciones destacadas, acompañada de una barra blanca de navegación sutil de 3 posiciones (`w-1/3 bg-white`) que marca estrictamente las 3 colecciones (la foto principal `hero_familia` no tiene sección en la barra, aunque se puede navegar a ella con los botones) y flechas circulares de control.

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

---

## 9. Dashboard Administrativo Ejecutivo (Dark Luxury Christmas)

El panel de control en `/admin` implementa la estética de alta gama **Dark Luxury Christmas** y métricas de hiperestacionalidad (temporada de árboles en Colombia, Octubre - Diciembre):

### Tokens de Diseño y Colores
* **Fondo Principal**: `#040d0a` con degradado radial `radial-gradient(circle at 50% 10%, #0d2c20 0%, #05140e 65%, #020806 100%)`.
* **Cards y Superficies**: `--app-bg-dark: #081a13` y `--app-bg-card: #0d281e`.
* **Acentos Festivos**:
  * Verde Esmeralda (`#22c55e`): Facturación, cumplimiento de metas y navegación activa.
  * Oro Navideño (`#eab308`): Árboles vendidos, temporada 2026 y pickup en tienda.
  * Rojo Alerta (`#ef4444`): Stock crítico, productos agotados y badges de urgencia.
  * Cian Logística (`#06b6d4`): Despachos y envíos con guía a domicilio.
* **Tipografías**: `Cinzel` (títulos, guías y logo) y `Plus Jakarta Sans` (interfaz y datos numéricos).

### Arquitectura de Componentes (`src/frontend/modules/admin/components/`)
1. **`AdminSidebar.tsx`**: Barra lateral de 250px con degradado sutil, navegación con badges de conteo dinámico, link rápido a tienda pública y comportamiento tipo drawer en móviles y tablets.
2. **`TopKpiCards.tsx`**: 3 tarjetas con anillos circulares SVG interactivos:
   * Facturación de Temporada (Oct – Dic) con % de cumplimiento sobre la meta diaria.
   * Árboles Vendidos vs Capacidad de Bodega (118 / 180 un.).
   * Logística Activa del Día (Envíos a Domicilio vs Retiro en Tienda "Ir por el arbolito").
3. **`SeasonSalesChart.tsx`**: Gráfica de `Chart.js` enfocada en las 12 semanas críticas (Oct S1 a Dic S4) con degradado verde esmeralda y destrucción obligatoria de la instancia en React 19 (`chartInstance.destroy()` en el cleanup de `useEffect`).
4. **`CategoryMixBar.tsx`**: Barra de progreso segmentada por categoría (Pinos Tradicionales 46%, Fibra Óptica 38%, Luces LED 11%, Pies de Árbol 5%).
5. **`CriticalStockList.tsx`**: Listado de árboles más demandados con variantes de altura (`2.10m`, `1.80m`, `2.40m`) y badges de urgencia (`¡AGOTADO!`, `Se agota hoy`, `Últimos`, `11 disp.`).

### Sincronización de Endpoints Limpios en el Panel Administrativo
* La navegación administrativa utiliza rutas limpias dedicadas mediante la convención `src/app/admin/[tab]/page.tsx`:
  * Panel General: `/admin`
  * Pedidos y Despachos: `/admin/pedidos`
  * Catálogo de Árboles: `/admin/productos`
  * Inventario y Secciones: `/admin/secciones`
  * Clientes y Leads: `/admin/clientes`
  * Configuración y 2FA: `/admin/usuarios`
* Si el usuario ingresa por URL legacy con query param (`/admin?tab=...`), el frontend sincroniza automáticamente la URL limpia sin recarga mediante `window.history.replaceState`.
* **Seguridad de Acceso**:
  * Si el usuario no tiene sesión válida, ninguna métrica, pedido o catálogo es filtrado; se muestra estrictamente la pantalla de autenticación 2FA.
  * La ruta `/admin/usuarios` está protegida por `proxy.ts` y controladores de API exclusivamente para roles `ADMIN` y `SUPERADMIN`.
  * Duración de sesión en cookie HttpOnly `barber_tech_session`: **3 horas** (`AUTH_SESSION_HOURS=3`), configurada con `sameSite: "lax"` y `maxAge: 10800`.

### Control Individual de 2FA por Usuario en Base de Datos (`tb_users.activacion_2fa`)
* El 2FA **NO es una configuración global** de la tienda, sino un atributo individual por cada cuenta (`tb_users.activacion_2fa`).
* En la pestaña **Configuración & 2FA** (`ViewUsuariosAdmin.tsx`), cada usuario cuenta con su propio conmutador (switch interactivo táctil) en la tabla y en las tarjetas móviles.
* Al presionar el conmutador de cualquier usuario:
  * Se despacha `PATCH /api/auth/users` con `{ id: usuario.id, activacion_2fa: boolean }`.
  * El controlador valida con Zod (`toggle2faSchema`), invoca `AuthService.toggle2FA` y actualiza la fila específica en `tb_users`.
* **Si para ese usuario `activacion_2fa = true`**: Al iniciar sesión con sus credenciales se genera un OTP de 6 dígitos enviado a su correo personal por SMTP (Gmail).
* **Si para ese usuario `activacion_2fa = false`**: Ese usuario específico ingresa directamente solo con su correo y contraseña, recibiendo su cookie de sesión de inmediato sin requerir código OTP.

### Limpieza de Consultas SQL en Servidor
* En `src/backend/config/prisma.ts`, el cliente de Prisma está configurado exclusivamente con `log: ['error', 'warn']`.
* Las sentencias internas `prisma:query BEGIN`, `SELECT`, `INSERT` y `COMMIT` quedan suprimidas de la consola de desarrollo, garantizando logs limpios y trazabilidad estricta.

---

## 10. Carga de Datos Server-Side (SSR) en Administración (`admin-loader.ts`)

Para evitar pantallas en blanco, parpadeos y problemas de autorización por cookies en el cliente, la carga de datos del panel administrativo se centraliza en el servidor:

* **Módulo Oficial**: `src/backend/modules/analytics/admin-loader.ts`.
* **Función Central**: `getAdminInitialData()`.
* **Carga en Paralelo**:
  ```typescript
  const [rawMetrics, rawCustomers, rawSections, rawUsers] = await Promise.all([
    analyticsService.getDashboardMetrics(),
    customerRepo.getAllCustomersWithPurchaseHistory(),
    catalogService.getAllSectionsForAdmin(),
    authRepo.listUsers(),
  ]);
  ```
* **Ventajas**:
  1. Las rutas `/admin` y `/admin/[tab]` inyectan las métricas, clientes, secciones y usuarios de `tb_users` directamente en el render inicial de React.
  2. `ViewUsuariosAdmin` recibe `initialUsers` y no muestra estados vacíos ni depende de una llamada inicial asíncrona de cliente para pintar la lista de usuarios.
  3. Los roles se normalizan a mayúsculas (`ADMIN`, `OPERADOR`, `SUPERADMIN`), y los controladores de autorización verifican contra la base de datos `tb_users` si existiera alguna discrepancia en el JWT.

---

## 11. Estética y Sistema Visual del Storefront (Dark Luxury Christmas 2026)

La tienda pública implementa la estética de alta gama **Dark Luxury Christmas** diseñada exclusivamente para la venta de árboles navideños de lujo:

* **Paleta de Color y Tokens Tailwind**:
  * **Fondo Principal del Viewport**: `#121417` (negro carbón profundo con acentos sutiles).
  * **Superficies, Contenedores y Modales**: `#16181c` con bordes finos `border-white/10`.
  * **Efecto de Cristal Festivo**: Clases utilitarias `.glass-card` y `.glass-pill` (`backdrop-filter: blur(20px)`, fondo `rgba(22, 24, 28, 0.68)` y hover con realce dorado).
  * **Oro Cálido de Marca (`brand-gold: #E5B869`)**: Precios principales, estrellas de calificación, badges de alta exclusividad, anillos de selección y botones CTA principales.
  * **Rojo Rubí (`brand-ruby: #B91C1C`)**: Badges de urgencia y acentos de temporada.
  * **Verde Esmeralda Nocturno (`brand-emerald: #0B291B` / `#22c55e`)**: Acentos lumínicos de fibra óptica y asesoría WhatsApp.
  * **Tipografías Oficiales**: `Outfit` (`font-display` para títulos editoriales, marcas de precio y botones) y `Plus Jakarta Sans` (`font-sans` para textos informativos, fichas técnicas y modales).

### Arquitectura de Componentes de la Tienda (`src/frontend/modules/store/components/`)
1. **`CommercialHero.tsx`**: Marco comercial de alta gama con carrusel interactivo de 4 escenas fotográficas en el fondo (`hero_familia.png` principal, `hero_familia_2.png`, `hero_familia_3.png`, `hero_familia_4.png`), 3 recuadros flotantes inferiores que muestran estrictamente las 3 colecciones (`hero_familia_2.png`, `hero_familia_3.png`, `hero_familia_4.png` sin mostrar hero_familia en los recuadros), logo oficial (`Logo_david_original.png`), controles circulares de navegación limpios (sin textos de 'Activo' ni contadores numéricos '01 / 04') y acceso rápido al carrito y buscador.
2. **`ChristmasTreeScene.tsx`**: Representación geométrica tridimensional del árbol de Navidad en rotación continua (24s por vuelta) compuesta por 180 nodos estelares interactivos, estrella apical dorada y partículas flotantes. Inicia automáticamente sin requerir intervención del usuario ni textos de arrastre.
3. **`HeightGuideSection.tsx`**: Guía interactiva de proporciones y alturas (`1.80m`, `2.10m`, `2.40m`) diseñada para techos residenciales de apartamentos y casas en Colombia.
4. **`CollectionSection.tsx`**: Catálogo segmentado en dos tradiciones botánicas: Pinos Tradicionales Canadienses (`arbol_tradicional.png`) y Árboles con Iluminación Fibra Óptica Micro-LED (`arbol_fibra.png`). Compra en 1 toque y enlace directo a WhatsApp.
5. **`BrandDifferenceSection.tsx`**: 4 tarjetas de valor diferencial (Follaje Ultra Denso, Iluminación Cero Enredos, Estructura de Acero Reforzada y Envío a toda Colombia con Guía).
6. **`ShowroomSection.tsx`**: Invitación a conocer los árboles en exhibición física en Bogotá y garantía de despacho nacional.
7. **`CommercialFooter.tsx`**: Pie de página de lujo con enlaces corporativos, horarios de atención decembrina, pasarelas de pago y soporte directo.

---

## 12. Reglas Estrictas del Carrito, Checkout y Modales

> [!IMPORTANT]
> **El carrito de compras y los modales deben mantener una coherencia visual y de copy rigurosa con la landing page.**

1. **Carrito de Compras (`CartDrawer.tsx`)**:
   * Contenedor lateral oscuro (`#16181c` con `border-l border-white/10`).
   * **REGLA ZERO-TAX**: Prohibido mostrar cualquier leyenda sobre impuestos ("Impuestos y costos de envío (si aplican) calculados al checkout").
   * **BOTÓN ÚNICO**: El botón de checkout debe tener como texto estrictamente **"Pagar"** (en fondo `brand-gold`, texto negro, esquinas redondeadas completas `rounded-full`). No usar textos como "Proceder al Pago Seguro (Sin Registro)".
2. **Modal de Detalle de Árboles (`ProductDetailModal.tsx`)**:
   * Fondo oscuro (`#16181c`), visor de zoom con lupa interactiva al pasar el cursor o pulsar en móviles.
   * Selector interactivo de variantes de altura en chips con borde dorado activo.
   * Botón "Agregar" en vidrio y botón "Comprar" en dorado brillante que abre el checkout inmediato.
3. **Modal de Checkout (`GuestCheckoutModal.tsx`)**:
   * Checkout ágil sin registro previo; agrupa órdenes automáticamente por el email del cliente.
   * Campos de formulario con tamaño de fuente mínimo de 16px (`text-base sm:text-sm`) para prevenir el zoom forzado de Safari en iOS.
   * Integración directa con pasarela Bold (PSE, Tarjeta de Crédito, Tarjeta de Débito) y modalidad de entrega a Domicilio o "Ir por el arbolito".
   * Botón directo: `Pagar $... COP` en botón dorado redondeado.
4. **Modal de Búsqueda Predictiva (`SearchModal.tsx`)**:
   * Búsqueda por coincidencia en vivo contra catálogo oficial en memoria. Cierre ágil con ESC o botón táctil.

---

## 13. Registro Histórico de Actualizaciones y Parámetros Obligatorios

Este registro documenta las decisiones de diseño y cambios obligatorios para prevenir regresiones en futuras iteraciones:

* **Octubre 2026 - Unificación Dark Luxury**:
  * **Problema Previo**: La página principal tenía colores verdes esmeralda tradicionales y el carrito/modales utilizaban fondos blancos desalineados con el nuevo concepto de alta gama.
  * **Solución Aplicada**: Migración integral a la paleta Dark Luxury (`#121417`, `#16181c`, `brand-gold: #E5B869`, `Outfit` y `Plus Jakarta Sans`).
  * **Fotografía Oficial**: Eliminación de imágenes genéricas y duplicadas. Se fijaron como únicos activos de producto: `hero_familia.png` (banner familiar del Hero), `arbol_tradicional.png` (pinos tradicionales) y `arbol_fibra.png` (árboles de fibra óptica), todos optimizados en WebP con Sharp.
  * **Simplificación del Carrito**: Supresión definitiva de menciones de impuestos y estandarización del botón en **"Pagar"**.
  * **Depuración del Carrusel Hero**: Remoción de los badges de texto ("Activo", "Más vendido", "Micro-LED", "Nieve Realista") en las fotos de los 3 recuadros inferiores para una estética fotográfica limpia. Se implementa la barra de navegación blanca (`w-1/3 bg-white`) con 3 secciones exclusivas para las 3 colecciones destacadas (la imagen de portada `hero_familia` no ocupa ranura en la barra pero se recorre con los botones circulares) y botones de navegación blancos de alto contraste (`bg-white text-black`), sin contadores numéricos invasivos (`01 / 04`). Las proporciones del contenedor inferior (`pb-6 sm:pb-8`, `space-y-3.5`) garantizan que la barra y botones se ubiquen en el viewport sin ser recortados por `overflow-hidden`.
  * **Navbar Persistente & Simplificado al Scrollear**: La barra de navegación se fijó de manera flotante (`fixed top-0 inset-x-0 z-50` con backdrop blur `#121417` al detectar scroll). Se eliminaron la barra de búsqueda y el icono de usuario/admin para suprimir elementos redundantes y espacios vacíos, manteniendo una distribución perfectamente equilibrada: Logo a la izquierda (acceso admin), 6 enlaces de sección al centro y botón de carrito con contador a la derecha.
  * **Persistencia**: Todo nuevo modal, sección o componente añadido en el futuro DEBE cumplir con los tokens oscuros (`#16181c`, `border-white/10`, `brand-gold`) y mantener la experiencia mobile-first sin auto-zoom en iOS.

---

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
