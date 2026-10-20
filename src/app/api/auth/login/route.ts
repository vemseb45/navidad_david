import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/modules/auth/auth.service';
import { setSessionCookie } from '@/backend/modules/auth/security/session.service';

const authService = new AuthService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { correo, contrasena } = body;

    if (!correo || !contrasena) {
      return NextResponse.json(
        { success: false, error: 'Correo electrónico y contraseña requeridos' },
        { status: 400 }
      );
    }

    const resultado = await authService.iniciarLogin(correo, contrasena);

    // Si no requiere 2FA, configuramos la cookie HttpOnly de inmediato
    if (!resultado.requiere2FA && resultado.token) {
      await setSessionCookie(resultado.token);
    }

    return NextResponse.json({
      success: true,
      ...resultado,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al autenticar usuario';
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}
