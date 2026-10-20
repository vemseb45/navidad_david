import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'storage', 'binaries', 'products');
const PUBLIC_IMG_DIR = path.join(process.cwd(), 'public', 'img');

// Imágenes de alta resolución curadas de Unsplash para Navidad David
const CATALOG_IMAGES = [
  {
    name: 'pino-canadiense-nevado.webp',
    url: 'https://images.unsplash.com/photo-1543258108-439ee9d34208?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'pino-canadiense-nevado-alt.webp',
    url: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'balsam-fir-premium.webp',
    url: 'https://images.unsplash.com/photo-1512474932049-78ac69ede12c?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'balsam-fir-premium-alt.webp',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'noble-pine-clasico.webp',
    url: 'https://images.unsplash.com/photo-1545645722-1ef96d67b2d4?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'noble-pine-clasico-alt.webp',
    url: 'https://images.unsplash.com/photo-1576267423048-15c0040fec78?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'artic-pine-nevado.webp',
    url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'artic-pine-nevado-alt.webp',
    url: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'fibra-optica-magia-estelar.webp',
    url: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'fibra-optica-magia-estelar-alt.webp',
    url: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'fibra-optica-aurora-boreal.webp',
    url: 'https://images.unsplash.com/photo-1576692155415-95f8fd94663e?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'fibra-optica-aurora-boreal-alt.webp',
    url: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'fibra-optica-cristal-glow.webp',
    url: 'https://images.unsplash.com/photo-1514897575457-c4db467cf78e?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'fibra-optica-cristal-glow-alt.webp',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'fibra-optica-nieve-polos.webp',
    url: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'fibra-optica-nieve-polos-alt.webp',
    url: 'https://images.unsplash.com/photo-1543258108-439ee9d34208?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'corona-real-imperial.webp',
    url: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'guirnalda-nevada-27m.webp',
    url: 'https://images.unsplash.com/photo-1545645722-1ef96d67b2d4?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'set-esferas-champagne-gold.webp',
    url: 'https://images.unsplash.com/photo-1512474932049-78ac69ede12c?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'luces-microled-500.webp',
    url: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'estrella-belen-puntera.webp',
    url: 'https://images.unsplash.com/photo-1576692155415-95f8fd94663e?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'faldon-terciopelo-burdeos.webp',
    url: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&w=1200&q=85',
  },
  // Categorías
  {
    name: 'cat-arboles-tradicionales.webp',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=85',
  },
  {
    name: 'cat-fibra-optica.webp',
    url: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=800&q=85',
  },
  {
    name: 'cat-accesorios.webp',
    url: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=800&q=85',
  },
  // Hero de Navidad David
  {
    name: 'hero-navidad-david.webp',
    url: 'https://images.unsplash.com/photo-1512474932049-78ac69ede12c?auto=format&fit=crop&w=1920&q=90',
  },
];

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(PUBLIC_IMG_DIR, { recursive: true });

  console.log(`🎄 Descargando y optimizando ${CATALOG_IMAGES.length} imágenes para Navidad David...`);

  for (const item of CATALOG_IMAGES) {
    try {
      const res = await fetch(item.url);
      if (!res.ok) {
        console.warn(`⚠ No se pudo descargar ${item.name} (${res.status})`);
        continue;
      }
      const arrayBuffer = await res.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      // Comprimir a WebP con Sharp a 900x1200 (proporción 3:4 elegante) o ancho natural
      const isHero = item.name.includes('hero');
      const isCat = item.name.includes('cat-');

      let sharpInstance = sharp(inputBuffer);
      if (isHero) {
        sharpInstance = sharpInstance.resize({ width: 1920, height: 1080, fit: 'cover' });
      } else if (isCat) {
        sharpInstance = sharpInstance.resize({ width: 800, height: 800, fit: 'cover' });
      } else {
        sharpInstance = sharpInstance.resize({ width: 900, height: 1200, fit: 'cover' });
      }

      const webpBuffer = await sharpInstance.webp({ quality: 84 }).toBuffer();

      // Guardar en storage/binaries/products/
      const outPathStorage = path.join(OUTPUT_DIR, item.name);
      await fs.writeFile(outPathStorage, webpBuffer);

      // También guardar copia en public/img/ para acceso estático directo
      const outPathPublic = path.join(PUBLIC_IMG_DIR, item.name);
      await fs.writeFile(outPathPublic, webpBuffer);

      console.log(`✔ ${item.name} (${Math.round(webpBuffer.length / 1024)} KB)`);
    } catch (e) {
      console.error(`❌ Error procesando ${item.name}:`, e.message);
    }
  }

  console.log('✨ Todas las imágenes descargadas y optimizadas en WebP con éxito.');
}

main();
