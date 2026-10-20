import { NextResponse } from 'next/server';

export interface ApiResponseData<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiResponse {
  public static success<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
  }

  public static created<T>(data: T) {
    return NextResponse.json({ success: true, data }, { status: 201 });
  }

  public static error(message: string, status = 400) {
    return NextResponse.json({ success: false, error: message }, { status });
  }

  public static notFound(message = 'Recurso no encontrado') {
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }

  public static serverError(error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
