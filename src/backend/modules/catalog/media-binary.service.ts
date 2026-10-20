import sharp from 'sharp';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export interface ProcessedBinaryImage {
  storagePath: string;
  widthPx: number;
  heightPx: number;
  sizeBytes: number;
  checksumSha256: string;
}

export class MediaBinaryService {
  private readonly binaryRootDir = path.join(process.cwd(), 'storage', 'binaries', 'products');

  public async compressAndStoreBinary(fileBuffer: Buffer, productSlug: string): Promise<ProcessedBinaryImage> {
    await fs.mkdir(this.binaryRootDir, { recursive: true });

    // Compresión a binario WebP optimizado (máximo 1200px de ancho, calidad 82%)
    const webpBuffer = await sharp(fileBuffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toBuffer();

    const metadata = await sharp(webpBuffer).metadata();
    const checksumSha256 = crypto.createHash('sha256').update(webpBuffer).digest('hex');
    const fileName = `${productSlug}-${checksumSha256.slice(0, 12)}.webp`;
    const absoluteFilePath = path.join(this.binaryRootDir, fileName);

    await fs.writeFile(absoluteFilePath, webpBuffer);

    return {
      storagePath: `/api/media/products/${fileName}`,
      widthPx: metadata.width ?? 800,
      heightPx: metadata.height ?? 1000,
      sizeBytes: webpBuffer.byteLength,
      checksumSha256,
    };
  }

  public async deleteBinaryFromDisk(storagePath: string): Promise<void> {
    const fileName = path.basename(storagePath);
    const absoluteFilePath = path.join(this.binaryRootDir, fileName);
    try {
      await fs.unlink(absoluteFilePath);
    } catch {
      // Si el binario ya fue limpiado del volumen, continuamos sin bloquear la transacción DB
    }
  }
}
