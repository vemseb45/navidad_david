import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export class MediaController {
  async serveBinary(
    _req: NextRequest,
    context: { params: Promise<{ path: string[] }> }
  ) {
    try {
      const { path: pathSegments } = await context.params;
      if (!pathSegments || pathSegments.length === 0) {
        return NextResponse.json({ error: 'Ruta no válida' }, { status: 400 });
      }

      const safeRelativePath = pathSegments.join('/').replace(/\.\./g, '');
      const binaryFilePath = path.join(process.cwd(), 'storage', 'binaries', safeRelativePath);

      let fileBuffer: Buffer;
      try {
        fileBuffer = await fs.readFile(binaryFilePath);
      } catch {
        // Fallback a public/img
        const fallbackPublicPath = path.join(
          process.cwd(),
          'public',
          'img',
          path.basename(safeRelativePath)
        );
        fileBuffer = await fs.readFile(fallbackPublicPath);
      }

      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      return NextResponse.json({ error: 'Binario de imagen no encontrado' }, { status: 404 });
    }
  }
}
