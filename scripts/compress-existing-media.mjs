import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const INPUT_DIR = process.argv[2] || './raw-images';
const OUTPUT_DIR = path.join(process.cwd(), 'storage', 'binaries', 'products');

async function run() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    let files = [];
    try {
      files = await fs.readdir(INPUT_DIR);
    } catch {
      console.log(`Directorio de origen ${INPUT_DIR} no encontrado. Creándolo como placeholder...`);
      await fs.mkdir(INPUT_DIR, { recursive: true });
      return;
    }

    for (const file of files) {
      if (!/\.(jpe?g|png|webp|avif)$/i.test(file)) continue;
      const rawBuffer = await fs.readFile(path.join(INPUT_DIR, file));
      const webpBuffer = await sharp(rawBuffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 82, effort: 6 })
        .toBuffer();

      const hash = crypto.createHash('sha256').update(webpBuffer).digest('hex').slice(0, 12);
      const cleanName = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const finalFileName = `${cleanName}-${hash}.webp`;

      await fs.writeFile(path.join(OUTPUT_DIR, finalFileName), webpBuffer);
      console.log(`✔ Binario generado: /api/media/products/${finalFileName}`);
    }
  } catch (error) {
    console.error('Error procesando imágenes:', error);
    process.exit(1);
  }
}

run();
