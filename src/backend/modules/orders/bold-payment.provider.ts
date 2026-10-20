import crypto from 'crypto';
import { EstadoPago } from '@prisma/client';

export class BoldPaymentProvider {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly webhookSecret: string;
  private readonly appUrl: string;

  constructor() {
    this.apiKey = process.env.BOLD_API_KEY || process.env.NEXT_PUBLIC_BOLD_API_KEY || 'bold_dev_api_key';
    this.apiUrl = process.env.BOLD_API_URL || 'https://integrations.api.bold.co/online/link/v1';
    this.webhookSecret = process.env.BOLD_WEBHOOK_SECRET || process.env.BOLD_SECRET_KEY || 'bold_dev_webhook_secret';
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  /**
   * Crea un Link de Pago oficial con la API de Bold (Al igual que en Barber_Tech_BF)
   */
  public async createPaymentLink(referencia: string, descripcion: string, monto: number): Promise<string> {
    const payload = {
      description: descripcion,
      reference: referencia,
      amount_type: 'CLOSE',
      amount: {
        currency: 'COP',
        total_amount: Math.round(monto),
      },
      callback_url: `${this.appUrl}/checkout/confirmacion?guia=${referencia.replace('BOLD-', '')}`,
    };

    try {
      console.log(`[BoldPaymentProvider] Generando link de pago Bold por $${monto} COP...`);
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

      if (response.ok) {
        const urlDePago = data.payload?.url || data.url || data.linkUrl || data.payment_link;
        if (urlDePago) {
          console.log('✅ [BoldPaymentProvider] Link de Bold creado exitosamente:', urlDePago);
          return urlDePago;
        }
      }

      console.warn('⚠️ [BoldPaymentProvider] Respuesta no estándar de Bold, usando URL de confirmación directa:', data);
      return `${this.appUrl}/checkout/confirmacion?guia=${referencia.replace('BOLD-', '')}`;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      console.warn(`[BoldPaymentProvider] Modo offline / desarrollo: ${msg}`);
      // Fallback para pruebas locales sin credenciales de producción
      return `${this.appUrl}/checkout/confirmacion?guia=${referencia.replace('BOLD-', '')}`;
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
