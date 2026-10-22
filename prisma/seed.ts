import { PrismaClient, MetodoEntrega, MetodoPago, EstadoPago, TipoLayoutSeccion } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('🎄 Iniciando siembra de datos normalizada para Navidad David...');

  // Limpiar datos existentes respetando restricciones referenciales
  await prisma.notificacionAdmin.deleteMany();
  await prisma.itemOrden.deleteMany();
  await prisma.orden.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.varianteProducto.deleteMany();
  await prisma.imagenProducto.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.subcategoria.deleteMany();
  await prisma.seccion.deleteMany();
  await prisma.usuario.deleteMany();

  // ==========================================
  // 1. USUARIOS ADMINISTRADORES (tb_users CON 2FA)
  // ==========================================
  const adminPrincipal = await prisma.usuario.create({
    data: {
      nombres_apellidos: 'David Administrador Principal',
      correo_electronico: 'sebastiansanchez1236@gmail.com',
      contrasena_hash: hashPassword('Admin123'),
      rol: 'ADMIN',
      activacion_2fa: true,
      esta_activo: true,
    },
  });

  const adminSecundario = await prisma.usuario.create({
    data: {
      nombres_apellidos: 'David Admin Secundario',
      correo_electronico: 'admin@navidaddavid.com',
      contrasena_hash: hashPassword('NavidadDavid2026*'),
      rol: 'ADMIN',
      activacion_2fa: true,
      esta_activo: true,
    },
  });

  const operadorVentas = await prisma.usuario.create({
    data: {
      nombres_apellidos: 'Carolina Auxiliar de Ventas',
      correo_electronico: 'ventas@navidaddavid.com',
      contrasena_hash: hashPassword('VentasDavid2026*'),
      rol: 'OPERADOR',
      activacion_2fa: true,
      esta_activo: true,
    },
  });

  console.log('👤 Usuarios administradores creados en tb_users:');
  console.log(` - Admin Principal: ${adminPrincipal.correo_electronico} (Clave: Admin123 | 2FA: Activo)`);
  console.log(` - Admin Secundario: ${adminSecundario.correo_electronico} (Clave: NavidadDavid2026* | 2FA: Activo)`);
  console.log(` - Operador: ${operadorVentas.correo_electronico} (Clave: VentasDavid2026* | 2FA: Activo)`);

  // ==========================================
  // 2. SECCIÓN 1: ÁRBOLES TRADICIONALES
  // ==========================================
  const seccionTradicionales = await prisma.seccion.create({
    data: {
      slug: 'arboles-tradicionales',
      titulo: 'Árboles Tradicionales',
      subtitulo: 'La esencia de la Navidad clásica con follaje frondoso de alta densidad',
      texto_badge: 'Colección Clásica',
      nombre_icono: 'forest',
      color_acento: 'primary',
      tipo_layout: TipoLayoutSeccion.TARJETAS_CON_VARIANTES,
      orden_visualizacion: 1,
      esta_activa: true,
    },
  });

  // Árbol Tradicional 1
  const arbolTrad1 = await prisma.producto.create({
    data: {
      id_seccion: seccionTradicionales.id,
      sku: 'ND-TRAD-001',
      nombre: 'Pino Canadiense Nevado Imperial',
      descripcion: 'Follaje ultra frondoso con efecto nevado glacial artesanal, ramas flexibles reforzadas en metal y base de soporte de alta estabilidad.',
      precio_base: 420000,
      precio_comparacion: 520000,
      badge_superior: 'Más Vendido',
      badge_inferior: 'Efecto Escarcha Real',
      stock: 25,
      orden_visualizacion: 1,
      esta_publicado: true,
      imagenes: {
        create: [
          {
            ruta_almacenamiento: '/api/media/products/pino-canadiense-nevado.webp',
            texto_alternativo: 'Pino Canadiense Nevado Imperial - Vista Frontal',
            ancho_px: 1200,
            alto_px: 1500,
            tamano_bytes: 124500,
            checksum_sha256: 'a1b2c3d4e5f60102030405060708091011121314151617181920212223242526',
            es_principal: true,
            orden: 1,
          },
        ],
      },
      variantes: {
        create: [
          { etiqueta: '1.80m', precio: 420000, stock: 10, es_predeterminada: true },
          { etiqueta: '2.10m', precio: 580000, stock: 8, es_predeterminada: false },
          { etiqueta: '2.40m', precio: 750000, stock: 7, es_predeterminada: false },
        ],
      },
    },
  });

  // Árbol Tradicional 2
  await prisma.producto.create({
    data: {
      id_seccion: seccionTradicionales.id,
      sku: 'ND-TRAD-002',
      nombre: 'Árbol Balsam Fir Premium Frondoso',
      descripcion: 'Diseño natural inspirado en los bosques de abeto del norte. Agujas bi-tono de tacto suave y silueta cónica majestuosa para grandes estancias.',
      precio_base: 380000,
      precio_comparacion: 460000,
      badge_superior: 'Calidad Premium',
      badge_inferior: 'Follaje Denso 1.200 Ramas',
      stock: 20,
      orden_visualizacion: 2,
      esta_publicado: true,
      imagenes: {
        create: [
          {
            ruta_almacenamiento: '/api/media/products/balsam-fir-premium.webp',
            texto_alternativo: 'Árbol Balsam Fir Premium - Vista General',
            ancho_px: 1200,
            alto_px: 1500,
            tamano_bytes: 118400,
            checksum_sha256: 'b2c3d4e5f6010203040506070809101112131415161718192021222324252627',
            es_principal: true,
            orden: 1,
          },
        ],
      },
      variantes: {
        create: [
          { etiqueta: '1.80m', precio: 380000, stock: 8, es_predeterminada: true },
          { etiqueta: '2.10m', precio: 520000, stock: 7, es_predeterminada: false },
          { etiqueta: '2.40m', precio: 680000, stock: 5, es_predeterminada: false },
        ],
      },
    },
  });

  // Árbol Tradicional 3
  await prisma.producto.create({
    data: {
      id_seccion: seccionTradicionales.id,
      sku: 'ND-TRAD-003',
      nombre: 'Árbol Noble Pine Clásico Verde Bosque',
      descripcion: 'El clásico indiscutible de las navidades familiares. Verde esmeralda profundo con ramas de alta resistencia para colgar guirnaldas y esferas pesadas.',
      precio_base: 340000,
      precio_comparacion: 410000,
      badge_superior: 'Tradición Familiar',
      badge_inferior: 'Fácil Armado en 3 Secciones',
      stock: 30,
      orden_visualizacion: 3,
      esta_publicado: true,
      imagenes: {
        create: [
          {
            ruta_almacenamiento: '/api/media/products/noble-pine-clasico.webp',
            texto_alternativo: 'Árbol Noble Pine Clásico Verde Bosque',
            ancho_px: 1200,
            alto_px: 1500,
            tamano_bytes: 115200,
            checksum_sha256: 'c3d4e5f601020304050607080910111213141516171819202122232425262728',
            es_principal: true,
            orden: 1,
          },
        ],
      },
      variantes: {
        create: [
          { etiqueta: '1.80m', precio: 340000, stock: 12, es_predeterminada: true },
          { etiqueta: '2.10m', precio: 470000, stock: 10, es_predeterminada: false },
          { etiqueta: '2.40m', precio: 610000, stock: 8, es_predeterminada: false },
        ],
      },
    },
  });

  // Árbol Tradicional 4
  await prisma.producto.create({
    data: {
      id_seccion: seccionTradicionales.id,
      sku: 'ND-TRAD-004',
      nombre: 'Árbol Nevado Glacial Artic Pine',
      descripcion: 'Acabado ártico con puntas perladas de nieve cristalizada y piñas naturales integradas. Crea una atmósfera invernal europea de ensueño.',
      precio_base: 460000,
      precio_comparacion: 560000,
      badge_superior: 'Edición Limitada',
      badge_inferior: 'Piñas Naturales Incluidas',
      stock: 15,
      orden_visualizacion: 4,
      esta_publicado: true,
      imagenes: {
        create: [
          {
            ruta_almacenamiento: '/api/media/products/artic-pine-nevado.webp',
            texto_alternativo: 'Árbol Nevado Glacial Artic Pine',
            ancho_px: 1200,
            alto_px: 1500,
            tamano_bytes: 132000,
            checksum_sha256: 'd4e5f60102030405060708091011121314151617181920212223242526272829',
            es_principal: true,
            orden: 1,
          },
        ],
      },
      variantes: {
        create: [
          { etiqueta: '1.80m', precio: 460000, stock: 6, es_predeterminada: true },
          { etiqueta: '2.10m', precio: 620000, stock: 5, es_predeterminada: false },
          { etiqueta: '2.40m', precio: 790000, stock: 4, es_predeterminada: false },
        ],
      },
    },
  });

  // ==========================================
  // 3. SECCIÓN 2: ÁRBOLES DE FIBRA ÓPTICA
  // ==========================================
  const seccionFibraOptica = await prisma.seccion.create({
    data: {
      slug: 'arboles-fibra-optica',
      titulo: 'Árboles de Fibra Óptica',
      subtitulo: 'Iluminación inteligente y efectos centelleantes integrados sin cables sueltos',
      texto_badge: 'Tecnología & Magia',
      nombre_icono: 'lightbulb',
      color_acento: 'secondary',
      tipo_layout: TipoLayoutSeccion.TARJETAS_CON_VARIANTES,
      orden_visualizacion: 2,
      esta_activa: true,
    },
  });

  // Árbol Fibra Óptica 1
  await prisma.producto.create({
    data: {
      id_seccion: seccionFibraOptica.id,
      sku: 'ND-FO-001',
      nombre: 'Árbol Fibra Óptica Magia Estelar Multicolor',
      descripcion: 'Fibras ópticas entrelazadas en cada rama con 8 secuencias de iluminación vibrante RGB, estrella superior luminosa y control de ritmos.',
      precio_base: 490000,
      precio_comparacion: 590000,
      badge_superior: 'Multicolor RGB',
      badge_inferior: 'Estrella Iluminada Incluida',
      stock: 18,
      orden_visualizacion: 1,
      esta_publicado: true,
      imagenes: {
        create: [
          {
            ruta_almacenamiento: '/api/media/products/fibra-optica-magia-estelar.webp',
            texto_alternativo: 'Árbol Fibra Óptica Magia Estelar Multicolor',
            ancho_px: 1200,
            alto_px: 1500,
            tamano_bytes: 129000,
            checksum_sha256: 'e5f6010203040506070809101112131415161718192021222324252627282930',
            es_principal: true,
            orden: 1,
          },
        ],
      },
      variantes: {
        create: [
          { etiqueta: '1.50m', precio: 390000, stock: 6, es_predeterminada: false },
          { etiqueta: '1.80m', precio: 490000, stock: 8, es_predeterminada: true },
          { etiqueta: '2.10m', precio: 650000, stock: 4, es_predeterminada: false },
        ],
      },
    },
  });

  // Árbol Fibra Óptica 2
  await prisma.producto.create({
    data: {
      id_seccion: seccionFibraOptica.id,
      sku: 'ND-FO-002',
      nombre: 'Árbol Fibra Óptica Aurora Boreal LED Cálido',
      descripcion: 'Elegante transición de luces cálidas doradas y ámbar con destellos de fibra óptica de alta refracción. Ambiente acogedor sin cables a la vista.',
      precio_base: 510000,
      precio_comparacion: 620000,
      badge_superior: 'Luz Cálida Dorada',
      badge_inferior: 'Bajo Consumo Energético',
      stock: 14,
      orden_visualizacion: 2,
      esta_publicado: true,
      imagenes: {
        create: [
          {
            ruta_almacenamiento: '/api/media/products/fibra-optica-aurora-boreal.webp',
            texto_alternativo: 'Árbol Fibra Óptica Aurora Boreal LED Cálido',
            ancho_px: 1200,
            alto_px: 1500,
            tamano_bytes: 121000,
            checksum_sha256: 'f601020304050607080910111213141516171819202122232425262728293031',
            es_principal: true,
            orden: 1,
          },
        ],
      },
      variantes: {
        create: [
          { etiqueta: '1.50m', precio: 410000, stock: 4, es_predeterminada: false },
          { etiqueta: '1.80m', precio: 510000, stock: 6, es_predeterminada: true },
          { etiqueta: '2.10m', precio: 680000, stock: 4, es_predeterminada: false },
        ],
      },
    },
  });

  // Árbol Fibra Óptica 3
  await prisma.producto.create({
    data: {
      id_seccion: seccionFibraOptica.id,
      sku: 'ND-FO-003',
      nombre: 'Árbol Fibra Óptica Cristal Glow Festivo',
      descripcion: 'Efecto destello diamante en las terminaciones de las ramas. Puntas reflectivas con iluminación sincronizada y base reforzada.',
      precio_base: 470000,
      precio_comparacion: 550000,
      badge_superior: 'Destello Cristal',
      badge_inferior: 'Secuencias Rítmicas',
      stock: 16,
      orden_visualizacion: 3,
      esta_publicado: true,
      imagenes: {
        create: [
          {
            ruta_almacenamiento: '/api/media/products/fibra-optica-cristal-glow.webp',
            texto_alternativo: 'Árbol Fibra Óptica Cristal Glow Festivo',
            ancho_px: 1200,
            alto_px: 1500,
            tamano_bytes: 119500,
            checksum_sha256: '0102030405060708091011121314151617181920212223242526272829303132',
            es_principal: true,
            orden: 1,
          },
        ],
      },
      variantes: {
        create: [
          { etiqueta: '1.50m', precio: 370000, stock: 5, es_predeterminada: false },
          { etiqueta: '1.80m', precio: 470000, stock: 7, es_predeterminada: true },
          { etiqueta: '2.10m', precio: 630000, stock: 4, es_predeterminada: false },
        ],
      },
    },
  });

  // Árbol Fibra Óptica 4
  await prisma.producto.create({
    data: {
      id_seccion: seccionFibraOptica.id,
      sku: 'ND-FO-004',
      nombre: 'Árbol Fibra Óptica Nieve & Destellos del Polo',
      descripcion: 'Ramas con cobertura blanca perlada y filamentos de fibra óptica azul hielo y blanco platino. Una experiencia de Polo Norte en tu hogar.',
      precio_base: 530000,
      precio_comparacion: 640000,
      badge_superior: 'Blanco Platino',
      badge_inferior: 'Sensor de Ritmo Navideño',
      stock: 12,
      orden_visualizacion: 4,
      esta_publicado: true,
      imagenes: {
        create: [
          {
            ruta_almacenamiento: '/api/media/products/fibra-optica-nieve-polos.webp',
            texto_alternativo: 'Árbol Fibra Óptica Nieve & Destellos del Polo',
            ancho_px: 1200,
            alto_px: 1500,
            tamano_bytes: 128700,
            checksum_sha256: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
            es_principal: true,
            orden: 1,
          },
        ],
      },
      variantes: {
        create: [
          { etiqueta: '1.50m', precio: 430000, stock: 4, es_predeterminada: false },
          { etiqueta: '1.80m', precio: 530000, stock: 5, es_predeterminada: true },
          { etiqueta: '2.10m', precio: 710000, stock: 3, es_predeterminada: false },
        ],
      },
    },
  });

  // ==========================================
  // 4. SECCIÓN 3: ADORNOS Y ACCESORIOS NAVIDEÑOS
  // ==========================================
  const seccionAccesorios = await prisma.seccion.create({
    data: {
      slug: 'adornos-y-accesorios',
      titulo: 'Adornos y Accesorios Navideños',
      subtitulo: 'Complementos artesanales de lujo para vestir tu hogar con elegancia festiva',
      texto_badge: 'Detalles Artesanales',
      nombre_icono: 'celebration',
      color_acento: 'tertiary',
      tipo_layout: TipoLayoutSeccion.CHIPS_FILTRABLES,
      orden_visualizacion: 3,
      esta_activa: true,
    },
  });

  // Subcategorías
  const subcatCoronas = await prisma.subcategoria.create({
    data: {
      id_seccion: seccionAccesorios.id,
      slug: 'coronas-y-guirnaldas',
      nombre: 'Coronas y Guirnaldas',
    },
  });

  const subcatEsferas = await prisma.subcategoria.create({
    data: {
      id_seccion: seccionAccesorios.id,
      slug: 'esferas-y-adornos',
      nombre: 'Esferas y Adornos',
    },
  });

  const subcatLuces = await prisma.subcategoria.create({
    data: {
      id_seccion: seccionAccesorios.id,
      slug: 'luces-y-puntas',
      nombre: 'Luces y Puntas de Árbol',
    },
  });

  const subcatFaldones = await prisma.subcategoria.create({
    data: {
      id_seccion: seccionAccesorios.id,
      slug: 'faldones-y-pies',
      nombre: 'Faldones y Pies de Árbol',
    },
  });

  // Accesorio 1 (Corona)
  await prisma.producto.create({
    data: {
      id_seccion: seccionAccesorios.id,
      id_subcategoria: subcatCoronas.id,
      sku: 'ND-ACC-001',
      nombre: 'Corona Navideña Real Imperial 60cm',
      descripcion: 'Corona para puerta principal con ramaje de abeto noble, bayas rojas silvestres, piñas de pino barnizadas y lazo de terciopelo burdeos.',
      precio_base: 125000,
      precio_comparacion: 155000,
      badge_superior: 'Puerta Principal',
      badge_inferior: 'Artesanal 60cm',
      stock: 40,
      orden_visualizacion: 1,
      esta_publicado: true,
      imagenes: {
        create: [
          {
            ruta_almacenamiento: '/api/media/products/corona-real-imperial.webp',
            texto_alternativo: 'Corona Navideña Real Imperial 60cm',
            ancho_px: 1000,
            alto_px: 1000,
            tamano_bytes: 85000,
            checksum_sha256: '2233445566778899aabbccddeeff00112233445566778899aabbccddeeff0011',
            es_principal: true,
            orden: 1,
          },
        ],
      },
    },
  });

  // Accesorio 2 (Guirnalda)
  await prisma.producto.create({
    data: {
      id_seccion: seccionAccesorios.id,
      id_subcategoria: subcatCoronas.id,
      sku: 'ND-ACC-002',
      nombre: 'Guirnalda Nevada con Piñas y Bayas 2.7m',
      descripcion: 'Guirnalda flexible de 2.7 metros para chimeneas, barandas de escalera o marcos de puerta. Follaje denso con toques de nieve escarchada.',
      precio_base: 110000,
      precio_comparacion: 135000,
      badge_superior: 'Decoración de Escaleras',
      badge_inferior: '2.70 Metros de Largo',
      stock: 35,
      orden_visualizacion: 2,
      esta_publicado: true,
      imagenes: {
        create: [
          {
            ruta_almacenamiento: '/api/media/products/guirnalda-nevada-27m.webp',
            texto_alternativo: 'Guirnalda Nevada con Piñas y Bayas 2.7m',
            ancho_px: 1000,
            alto_px: 1000,
            tamano_bytes: 92000,
            checksum_sha256: '33445566778899aabbccddeeff00112233445566778899aabbccddeeff001122',
            es_principal: true,
            orden: 1,
          },
        ],
      },
    },
  });

  // Accesorio 3 (Esferas)
  await prisma.producto.create({
    data: {
      id_seccion: seccionAccesorios.id,
      id_subcategoria: subcatEsferas.id,
      sku: 'ND-ACC-003',
      nombre: 'Set de 24 Esferas Navideñas Champagne & Gold',
      descripcion: 'Colección de 24 esferas irrompibles de 8cm con acabados brillante, mate y escarchado con filigranas doradas pintadas a mano.',
      precio_base: 89000,
      precio_comparacion: 115000,
      badge_superior: 'Set x24 Unidades',
      badge_inferior: 'Material Irrompible Seguro',
      stock: 50,
      orden_visualizacion: 3,
      esta_publicado: true,
      imagenes: {
        create: [
          {
            ruta_almacenamiento: '/api/media/products/set-esferas-champagne-gold.webp',
            texto_alternativo: 'Set de 24 Esferas Navideñas Champagne & Gold',
            ancho_px: 1000,
            alto_px: 1000,
            tamano_bytes: 81000,
            checksum_sha256: '445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233',
            es_principal: true,
            orden: 1,
          },
        ],
      },
    },
  });

  // Accesorio 4 (Luces)
  await prisma.producto.create({
    data: {
      id_seccion: seccionAccesorios.id,
      id_subcategoria: subcatLuces.id,
      sku: 'ND-ACC-004',
      nombre: 'Luces MicroLED Cálidas 500 Luces (50m)',
      descripcion: 'Cadena de 500 microLEDs cálidos en cable de cobre ultrafino y discreto. 8 modos de parpadeo, aptas para interiores y exteriores techados.',
      precio_base: 78000,
      precio_comparacion: 95000,
      badge_superior: '500 MicroLEDs',
      badge_inferior: 'Cable Cobre Invisible 50m',
      stock: 60,
      orden_visualizacion: 4,
      esta_publicado: true,
      imagenes: {
        create: [
          {
            ruta_almacenamiento: '/api/media/products/luces-microled-500.webp',
            texto_alternativo: 'Luces MicroLED Cálidas 500 Luces (50m)',
            ancho_px: 1000,
            alto_px: 1000,
            tamano_bytes: 76000,
            checksum_sha256: '5566778899aabbccddeeff00112233445566778899aabbccddeeff0011223344',
            es_principal: true,
            orden: 1,
          },
        ],
      },
    },
  });

  // Accesorio 5 (Estrella Puntera)
  await prisma.producto.create({
    data: {
      id_seccion: seccionAccesorios.id,
      id_subcategoria: subcatLuces.id,
      sku: 'ND-ACC-005',
      nombre: 'Estrella de Belén Iluminada para Punta de Árbol',
      descripcion: 'Puntera en forma de estrella de 8 puntas con estructura calada en metal dorado e iluminación LED interna con proyector de constelaciones.',
      precio_base: 95000,
      precio_comparacion: 120000,
      badge_superior: 'Punta de Árbol',
      badge_inferior: 'Proyección LED Techo',
      stock: 30,
      orden_visualizacion: 5,
      esta_publicado: true,
      imagenes: {
        create: [
          {
            ruta_almacenamiento: '/api/media/products/estrella-belen-puntera.webp',
            texto_alternativo: 'Estrella de Belén Iluminada para Punta de Árbol',
            ancho_px: 1000,
            alto_px: 1000,
            tamano_bytes: 89000,
            checksum_sha256: '66778899aabbccddeeff00112233445566778899aabbccddeeff001122334455',
            es_principal: true,
            orden: 1,
          },
        ],
      },
    },
  });

  // Accesorio 6 (Faldón)
  await prisma.producto.create({
    data: {
      id_seccion: seccionAccesorios.id,
      id_subcategoria: subcatFaldones.id,
      sku: 'ND-ACC-006',
      nombre: 'Faldón de Terciopelo Burdeos Bordado en Hilo Dorado',
      descripcion: 'Pie de árbol circular de 120cm en terciopelo suave de alta densidad con ribete de pelo sintético blanco y bordados tradicionales navideños.',
      precio_base: 115000,
      precio_comparacion: 140000,
      badge_superior: 'Terciopelo Premium',
      badge_inferior: 'Diámetro 120cm Universal',
      stock: 25,
      orden_visualizacion: 6,
      esta_publicado: true,
      imagenes: {
        create: [
          {
            ruta_almacenamiento: '/api/media/products/faldon-terciopelo-burdeos.webp',
            texto_alternativo: 'Faldón de Terciopelo Burdeos Bordado en Hilo Dorado',
            ancho_px: 1000,
            alto_px: 1000,
            tamano_bytes: 94000,
            checksum_sha256: '778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566',
            es_principal: true,
            orden: 1,
          },
        ],
      },
    },
  });

  // ==========================================
  // 5. CLIENTES Y ÓRDENES MULTI-CATEGORÍA
  // ==========================================
  const pTrad1 = await prisma.producto.findUniqueOrThrow({ where: { sku: 'ND-TRAD-001' } });
  const pTrad2 = await prisma.producto.findUniqueOrThrow({ where: { sku: 'ND-TRAD-002' } });
  const pFibra1 = await prisma.producto.findUniqueOrThrow({ where: { sku: 'ND-FO-001' } });
  const pFibra2 = await prisma.producto.findUniqueOrThrow({ where: { sku: 'ND-FO-002' } });
  const pAcc1 = await prisma.producto.findUniqueOrThrow({ where: { sku: 'ND-ACC-001' } });
  const pAcc2 = await prisma.producto.findUniqueOrThrow({ where: { sku: 'ND-ACC-002' } });
  const pAcc4 = await prisma.producto.findUniqueOrThrow({ where: { sku: 'ND-ACC-004' } });
  const pAcc5 = await prisma.producto.findUniqueOrThrow({ where: { sku: 'ND-ACC-005' } });
  const pAcc6 = await prisma.producto.findUniqueOrThrow({ where: { sku: 'ND-ACC-006' } });

  const clienteEjemplo = await prisma.cliente.create({
    data: {
      correo_electronico: 'carolina.gomez@gmail.com',
      nombres_apellidos: 'Carolina Gómez Restrepo',
      telefono: '+57 310 456 7890',
    },
  });

  // Primera compra
  const ordenEjemplo1 = await prisma.orden.create({
    data: {
      numero_guia: 'ND-2026-F89A12',
      referencia_bold: 'BOLD-ND-2026-F89A12',
      id_cliente: clienteEjemplo.id,
      metodo_entrega: MetodoEntrega.RECOGIDA_TIENDA,
      metodo_pago: MetodoPago.PSE,
      estado_pago: EstadoPago.APROBADO,
      id_transaccion_bold: 'TX-BOLD-99882211',
      url_pago_bold: 'https://checkout.bold.co/mock/ND-2026-F89A12',
      monto_total: 420000,
      items: {
        create: [
          {
            id_producto: pTrad1.id,
            nombre_producto: pTrad1.nombre,
            nombre_variante: '1.80m',
            cantidad: 1,
            precio_unitario: 420000,
            subtotal: 420000,
          },
        ],
      },
    },
  });

  // Segunda compra para destacarla como cliente frecuente
  await prisma.orden.create({
    data: {
      numero_guia: 'ND-2026-B32C99',
      referencia_bold: 'BOLD-ND-2026-B32C99',
      id_cliente: clienteEjemplo.id,
      metodo_entrega: MetodoEntrega.DOMICILIO,
      direccion_envio: 'Calle 127 #15-32 Apto 402',
      ciudad_envio: 'Bogotá',
      metodo_pago: MetodoPago.TARJETA_CREDITO,
      estado_pago: EstadoPago.APROBADO,
      id_transaccion_bold: 'TX-BOLD-77441122',
      url_pago_bold: 'https://checkout.bold.co/mock/ND-2026-B32C99',
      monto_total: 125000,
      items: {
        create: [
          {
            id_producto: pTrad1.id,
            nombre_producto: 'Corona Navideña Real Imperial 60cm',
            nombre_variante: 'Artesanal 60cm',
            cantidad: 1,
            precio_unitario: 125000,
            subtotal: 125000,
          },
        ],
      },
    },
  });

  // Clientes adicionales con compras en diferentes categorías
  const cliente2 = await prisma.cliente.create({
    data: {
      correo_electronico: 'alejandro.mejia@gmail.com',
      nombres_apellidos: 'Alejandro Mejía Salgar',
      telefono: '+57 300 234 5678',
    },
  });

  await prisma.orden.create({
    data: {
      numero_guia: 'ND-2026-M45K88',
      referencia_bold: 'BOLD-ND-2026-M45K88',
      id_cliente: cliente2.id,
      metodo_entrega: MetodoEntrega.DOMICILIO,
      direccion_envio: 'Carrera 43A #7-50 El Poblado',
      ciudad_envio: 'Medellín',
      metodo_pago: MetodoPago.PSE,
      estado_pago: EstadoPago.APROBADO,
      id_transaccion_bold: 'TX-BOLD-66554433',
      url_pago_bold: 'https://checkout.bold.co/mock/ND-2026-M45K88',
      monto_total: 545000,
      items: {
        create: [
          {
            id_producto: pFibra1.id,
            nombre_producto: pFibra1.nombre,
            nombre_variante: '1.80m',
            cantidad: 1,
            precio_unitario: 480000,
            subtotal: 480000,
          },
          {
            id_producto: pAcc4.id,
            nombre_producto: pAcc4.nombre,
            nombre_variante: 'MicroLED 50m',
            cantidad: 1,
            precio_unitario: 65000,
            subtotal: 65000,
          },
        ],
      },
    },
  });

  const cliente3 = await prisma.cliente.create({
    data: {
      correo_electronico: 'valentina.ospina@outlook.com',
      nombres_apellidos: 'Valentina Ospina Londoño',
      telefono: '+57 312 987 6543',
    },
  });

  await prisma.orden.create({
    data: {
      numero_guia: 'ND-2026-V12P34',
      referencia_bold: 'BOLD-ND-2026-V12P34',
      id_cliente: cliente3.id,
      metodo_entrega: MetodoEntrega.RECOGIDA_TIENDA,
      ciudad_envio: 'Bogotá',
      metodo_pago: MetodoPago.TARJETA_DEBITO,
      estado_pago: EstadoPago.APROBADO,
      id_transaccion_bold: 'TX-BOLD-11223344',
      url_pago_bold: 'https://checkout.bold.co/mock/ND-2026-V12P34',
      monto_total: 695000,
      items: {
        create: [
          {
            id_producto: pTrad2.id,
            nombre_producto: pTrad2.nombre,
            nombre_variante: '2.10m',
            cantidad: 1,
            precio_unitario: 580000,
            subtotal: 580000,
          },
          {
            id_producto: pAcc6.id,
            nombre_producto: pAcc6.nombre,
            nombre_variante: 'Terciopelo 120cm',
            cantidad: 1,
            precio_unitario: 115000,
            subtotal: 115000,
          },
        ],
      },
    },
  });

  const cliente4 = await prisma.cliente.create({
    data: {
      correo_electronico: 'santiago.morales@hotmail.com',
      nombres_apellidos: 'Santiago Morales Echeverri',
      telefono: '+57 315 444 8899',
    },
  });

  await prisma.orden.create({
    data: {
      numero_guia: 'ND-2026-S78T90',
      referencia_bold: 'BOLD-ND-2026-S78T90',
      id_cliente: cliente4.id,
      metodo_entrega: MetodoEntrega.DOMICILIO,
      direccion_envio: 'Avenida San Joaquín #14-22',
      ciudad_envio: 'Cali',
      metodo_pago: MetodoPago.PSE,
      estado_pago: EstadoPago.APROBADO,
      id_transaccion_bold: 'TX-BOLD-55667788',
      url_pago_bold: 'https://checkout.bold.co/mock/ND-2026-S78T90',
      monto_total: 590000,
      items: {
        create: [
          {
            id_producto: pFibra2.id,
            nombre_producto: pFibra2.nombre,
            nombre_variante: '2.10m',
            cantidad: 1,
            precio_unitario: 590000,
            subtotal: 590000,
          },
        ],
      },
    },
  });

  const cliente5 = await prisma.cliente.create({
    data: {
      correo_electronico: 'mariana.duque@gmail.com',
      nombres_apellidos: 'Mariana Duque Castro',
      telefono: '+57 318 777 9922',
    },
  });

  await prisma.orden.create({
    data: {
      numero_guia: 'ND-2026-D90L11',
      referencia_bold: 'BOLD-ND-2026-D90L11',
      id_cliente: cliente5.id,
      metodo_entrega: MetodoEntrega.DOMICILIO,
      direccion_envio: 'Calle 84 #51B-30',
      ciudad_envio: 'Barranquilla',
      metodo_pago: MetodoPago.TARJETA_CREDITO,
      estado_pago: EstadoPago.APROBADO,
      id_transaccion_bold: 'TX-BOLD-99001122',
      url_pago_bold: 'https://checkout.bold.co/mock/ND-2026-D90L11',
      monto_total: 260000,
      items: {
        create: [
          {
            id_producto: pAcc1.id,
            nombre_producto: pAcc1.nombre,
            nombre_variante: '2.7m Ultra Tupida',
            cantidad: 1,
            precio_unitario: 85000,
            subtotal: 85000,
          },
          {
            id_producto: pAcc2.id,
            nombre_producto: pAcc2.nombre,
            nombre_variante: 'Set x24 Marsala',
            cantidad: 1,
            precio_unitario: 89000,
            subtotal: 89000,
          },
          {
            id_producto: pAcc5.id,
            nombre_producto: pAcc5.nombre,
            nombre_variante: 'Estrella Belén',
            cantidad: 1,
            precio_unitario: 86000,
            subtotal: 86000,
          },
        ],
      },
    },
  });
  await prisma.notificacionAdmin.create({
    data: {
      id_orden: ordenEjemplo1.id,
      titulo: '🎄 ¡Compra aprobada por Bold: $420.000 COP!',
      resumen: 'Guía: ND-2026-F89A12 | Cliente: Carolina Gómez Restrepo | Producto: 1x Pino Canadiense Nevado Imperial (1.80m)',
      esta_leida: false,
    },
  });

  console.log('✅ Siembra completada con éxito:');
  console.log(' - Tabla tb_users: 2 Administradores con soporte de 2FA.');
  console.log(' - 3 Secciones creadas (Árboles Tradicionales, Fibra Óptica, Accesorios).');
  console.log(' - 14 Productos exactos creados según el catálogo de Navidad David.');
  console.log(' - 1 Cliente frecuente inicial con 2 órdenes aprobadas y notificaciones.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
