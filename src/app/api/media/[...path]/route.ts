import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
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

    const fileBuffer = await fs.readFile(binaryFilePath);
    return new NextResponse(fileBuffer, {
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
