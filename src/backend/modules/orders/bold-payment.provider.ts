import crypto from 'crypto';
import { EstadoPago } from '@prisma/client';

export class BoldPaymentProvider {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly webhookSecret: string;
  private readonly appUrl: string;

  constructor() {
    this.apiKey = process.env.BOLD_API_KEY || '';
    this.apiUrl = process.env.BOLD_API_URL || 'https://integrations.api.bold.co/online/link/v1';
    this.webhookSecret = process.env.BOLD_WEBHOOK_SECRET || '';
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  /**
   * Crea un Link de Pago oficial con la API de Bold (Al igual que en Barber_Tech_BF)
   */
  public async createPaymentLink(referencia: string, descripcion: string, monto: number): Promise<string> {
    if (!this.apiKey || !this.apiUrl) {
      console.error('❌ [BoldPaymentProvider] Faltan variables de entorno BOLD_API_KEY o BOLD_API_URL');
      throw new Error('Credenciales de pasarela Bold incompletas en el servidor.');
    }

    const payload = {
      description: descripcion,
      reference: referencia,
      amount_type: 'CLOSE',
      amount: {
        currency: 'COP',
        total_amount: Math.round(monto),
      },
    };

    try {
      console.log(`[BoldPaymentProvider] Generando link de pago oficial Bold por $${monto} COP...`);
      console.log(`[BoldPaymentProvider] Payload:`, JSON.stringify(payload));

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `x-api-key ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [BoldPaymentProvider] Error devuelto por la API de Bold:', JSON.stringify(data, null, 2));
        const errMsg =
          data.message ||
          data.error ||
          (Array.isArray(data.errors) && data.errors[0]?.message) ||
          'Error en la respuesta de Bold';
        throw new Error(`Error en la pasarela Bold: ${errMsg}`);
      }

      // Dependiendo de la versión de la API de Bold, devuelven la URL del link en una de estas variables
      const urlDePago = data.payload?.url || data.url || data.linkUrl || data.payment_link || '';

      if (!urlDePago) {
        console.error('❌ [BoldPaymentProvider] No se recibió URL de pago en la respuesta de Bold:', data);
        throw new Error('Bold no retornó una URL de pago válida.');
      }

      console.log('✅ [BoldPaymentProvider] Link de Bold creado exitosamente:', urlDePago);
      return urlDePago;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido comunicando con Bold';
      console.error('❌ [BoldPaymentProvider] Excepción generando link de Bold:', msg);
      throw new Error(msg);
    }
  }

  /**
   * Validación criptográfica de la firma del Webhook de Bold
   */
  public validateBoldSignature(rawBody: string, signature: string | null): boolean {
    if (!signature) return true; // Permitir en pruebas si no viene cabecera

    try {
      const encodedBody = Buffer.from(rawBody, 'utf-8').toString('base64');
      const hashed = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(encodedBody)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(hashed),
        Buffer.from(signature)
      );
    } catch (error) {
      console.error('[Bold Webhook] Error verificando firma:', error);
      return false;
    }
  }

  /**
   * Mapeo de estados del Webhook de Bold a EstadoPago de Prisma
   */
  public mapBoldStatus(tipoEvento: string | undefined): EstadoPago {
    if (!tipoEvento) return EstadoPago.PENDIENTE;
    const norm = tipoEvento.toUpperCase();
    if (norm === 'SALE_APPROVED' || norm === 'APPROVED' || norm === 'PAID') {
      return EstadoPago.APROBADO;
    }
    if (norm === 'SALE_REJECTED' || norm === 'REJECTED' || norm === 'FAILED') {
      return EstadoPago.RECHAZADO;
    }
    return EstadoPago.PENDIENTE;
  }

  /**
   * Sincronización Fallback de Bold en caso de pérdida de webhook
   */
  public async sincronizarEstadoFallback(referenciaExterna: string): Promise<string | null> {
    try {
      const url = `https://integrations.api.bold.co/payments/webhook/notifications/${referenciaExterna}?is_external_reference=true`;
      const respuesta = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `x-api-key ${this.apiKey}`,
        },
      });

      if (!respuesta.ok) return null;
      const data = await respuesta.json();
      if (data.notifications && data.notifications.length > 0) {
        return data.notifications[0].type;
      }
    } catch (error) {
      console.error('[Bold Fallback] Error consultando estado en Bold:', error);
    }
    return null;
  }
}
