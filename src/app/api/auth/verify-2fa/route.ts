import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/modules/auth/auth.service';
import { setSessionCookie } from '@/backend/modules/auth/security/session.service';

const authService = new AuthService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { usuarioId, codigo, preAuthToken } = body;

    if (!usuarioId || !codigo) {
      return NextResponse.json(
        { success: false, error: 'Identificador de usuario y código 2FA requeridos' },
        { status: 400 }
      );
    }

    const resultado = await authService.verificar2FA(usuarioId, codigo, preAuthToken);

    // Configurar la Cookie HttpOnly segura con el JWT
    await setSessionCookie(resultado.token);

    return NextResponse.json({
      success: true,
      token: resultado.token,
      usuario: resultado.usuario,
      message: 'Autenticación 2FA exitosa. Sesión HttpOnly establecida.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al validar 2FA';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
