import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/backend/modules/auth/security/session.service';
import { readToken } from '@/backend/modules/auth/security/token.service';

export async function GET(req: NextRequest) {
  try {
    // 1. Intentar obtener desde la Cookie HttpOnly
    let user = await getSessionUser();

    // 2. Si no viene en cookie, intentar desde Authorization: Bearer <token>
    if (!user) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        user = readToken(token);
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error verificando sesión';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
