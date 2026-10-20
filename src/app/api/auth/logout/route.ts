import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/backend/modules/auth/security/session.service';

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente y cookie HttpOnly eliminada',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al cerrar sesión';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
