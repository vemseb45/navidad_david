import { NextResponse } from 'next/server';

/**
 * Helper estandarizado para respuestas JSON de la API
 * Siguiendo la arquitectura de Barber_Tech_BF
 */
export function apiResponse<T = any>(
  success: boolean,
  message: string,
  data: T | null = null,
  status: number = 200,
  errors: any = null
) {
  return NextResponse.json(
    {
      success,
      message,
      data,
      ...(errors ? { errors } : {}),
    },
    { status }
  );
}
