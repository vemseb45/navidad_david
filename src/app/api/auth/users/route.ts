import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/modules/auth/auth.service';

const authService = new AuthService();

export async function GET() {
  try {
    const usuarios = await authService.listarUsuarios();
    return NextResponse.json({
      success: true,
      data: usuarios.map((u) => ({
        ...u,
        fecha_creacion: u.fecha_creacion.toISOString(),
        fecha_actualizacion: u.fecha_actualizacion.toISOString(),
        ultimo_login: u.ultimo_login ? u.ultimo_login.toISOString() : null,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al listar usuarios';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombres_apellidos, correo_electronico, contrasena, rol, activacion_2fa } = body;

    if (!nombres_apellidos || !correo_electronico || !contrasena) {
      return NextResponse.json(
        { success: false, error: 'Nombre, correo electrónico y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const nuevoUsuario = await authService.crearUsuario({
      nombres_apellidos,
      correo_electronico,
      contrasena,
      rol,
      activacion_2fa,
    });

    return NextResponse.json(
      {
        success: true,
        data: nuevoUsuario,
        message: 'Usuario administrador creado exitosamente en tb_users',
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear usuario';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, activacion_2fa } = body;

    if (!id || activacion_2fa === undefined) {
      return NextResponse.json(
        { success: false, error: 'Identificador y estado 2FA requeridos' },
        { status: 400 }
      );
    }

    const actualizado = await authService.alternar2FA(id, Boolean(activacion_2fa));
    return NextResponse.json({
      success: true,
      data: actualizado,
      message: `2FA ${activacion_2fa ? 'activado' : 'desactivado'} con éxito`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar 2FA';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de usuario requerido' }, { status: 400 });
    }

    await authService.eliminarUsuario(id);
    return NextResponse.json({ success: true, message: 'Usuario eliminado correctamente de tb_users' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar usuario';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
