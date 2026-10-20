import nodemailer from 'nodemailer';

// Transporter SMTP reutilizable configurado con las credenciales del sistema
export function getEmailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Envía el código de doble factor de autenticación (2FA) por correo electrónico.
 */
export async function send2FAEmail(
  to: string,
  userName: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const from = process.env.SMTP_FROM || '"Navidad David Seguridad" <soporte@navidaddavid.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Código de Seguridad 2FA - Navidad David</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f3ef; margin: 0; padding: 24px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e4e2de; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <!-- HEADER -->
        <tr>
          <td style="background: linear-gradient(135deg, #002718 0%, #133e2b 100%); padding: 32px 24px; text-align: center;">
            <div style="font-size: 32px; line-height: 1;">🎄</div>
            <h1 style="color: #ffffff; font-size: 22px; font-weight: bold; margin: 12px 0 4px 0; letter-spacing: -0.5px;">Navidad David</h1>
            <p style="color: #ffe088; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Panel de Control Administrativo • Seguridad 2FA</p>
          </td>
        </tr>
        
        <!-- BODY -->
        <tr>
          <td style="padding: 32px 28px;">
            <p style="color: #2d3748; font-size: 15px; margin: 0 0 16px 0;">
              Hola, <strong>${userName || 'Administrador'}</strong>:
            </p>
            <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              Has iniciado sesión en el panel administrativo de <strong>Navidad David</strong>. Para completar tu acceso protegido, ingresa el siguiente código de verificación de 6 dígitos:
            </p>

            <!-- CÓDIGO 2FA DESTACADO -->
            <div style="background-color: #fbf9f5; border: 2px dashed #133e2b; border-radius: 14px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #b90d1c; display: block; margin-left: 10px;">
                ${code}
              </span>
            </div>

            <p style="color: #718096; font-size: 12px; line-height: 1.5; margin: 0 0 16px 0;">
              ⏱ <strong>Tiempo de expiración:</strong> Este código es válido únicamente durante los próximos <strong>5 minutos</strong> y puede ser utilizado una sola vez.
            </p>
            
            <p style="color: #718096; font-size: 12px; line-height: 1.5; margin: 0;">
              🔒 <strong>Aviso de seguridad:</strong> Si no fuiste tú quien solicitó este acceso, comunícate inmediatamente con el equipo de soporte técnico y cambia tus credenciales.
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background-color: #f8f7f4; padding: 20px 24px; text-align: center; border-top: 1px solid #e4e2de;">
            <p style="color: #a0aec0; font-size: 11px; margin: 0;">
              Navidad David — Artisan Christmas Co. &copy; 2026. Todos los derechos reservados.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const transporter = getEmailTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject: `🎄 [${code}] Tu código de verificación 2FA - Navidad David`,
      html: htmlContent,
      text: `Navidad David - Código de verificación 2FA: ${code}. Válido por 5 minutos.`,
    });

    console.log(`✉ [SMTP 2FA] Correo enviado a ${to} (MessageId: ${info.messageId})`);
    return { success: true };
  } catch (error) {
    console.error(`❌ [SMTP 2FA ERROR] Fallo al enviar código a ${to}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al enviar correo SMTP',
    };
  }
}
