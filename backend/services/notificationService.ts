import { HomologationStatus } from "../types/homologation.types.ts";

// Email configuration from environment
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "noreply@av-homologacion.com";
const SMTP_HOST = Deno.env.get("SMTP_HOST") || "";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "587");
const SMTP_USER = Deno.env.get("SMTP_USER") || "";
const SMTP_PASS = Deno.env.get("SMTP_PASS") || "";
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:3000";

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  html: string;
}

export interface NotificationContext {
  ownerFullName: string;
  ownerEmail: string;
  homologationId: string;
  status: string;
  reason?: string;
}

// Email templates for different status changes
const EMAIL_TEMPLATES: Record<string, (ctx: NotificationContext) => EmailNotification> = {
  [HomologationStatus.PENDING_REVIEW]: (ctx) => ({
    to: ctx.ownerEmail,
    subject: "Homologación Recibida - AV Homologación",
    body: `
Estimado/a ${ctx.ownerFullName},

Su solicitud de homologación ha sido recibida exitosamente y está pendiente de revisión.

Número de solicitud: ${ctx.homologationId}
Estado actual: En Revisión

Puede consultar el estado de su solicitud en:
${APP_URL}/homologaciones/${ctx.homologationId}

Saludos cordiales,
Equipo AV Homologación
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f7f7f7; }
    .status { background: #fef3c7; padding: 10px; border-radius: 4px; margin: 15px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AV Homologación</h1>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${ctx.ownerFullName}</strong>,</p>
      <p>Su solicitud de homologación ha sido recibida exitosamente y está pendiente de revisión.</p>
      <div class="status">
        <p><strong>Número de solicitud:</strong> ${ctx.homologationId}</p>
        <p><strong>Estado actual:</strong> En Revisión</p>
      </div>
      <p style="text-align: center;">
        <a href="${APP_URL}/homologaciones/${ctx.homologationId}" class="button">Ver Estado de Solicitud</a>
      </p>
    </div>
    <div class="footer">
      <p>Saludos cordiales,<br>Equipo AV Homologación</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }),

  [HomologationStatus.PAYED]: (ctx) => ({
    to: ctx.ownerEmail,
    subject: "Pago Confirmado - AV Homologación",
    body: `
Estimado/a ${ctx.ownerFullName},

Hemos recibido su pago para la solicitud de homologación.

Número de solicitud: ${ctx.homologationId}
Estado actual: Pagado - En proceso de aprobación

Su solicitud será revisada y procesada en los próximos días hábiles.

Saludos cordiales,
Equipo AV Homologación
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f7f7f7; }
    .status { background: #d1fae5; padding: 10px; border-radius: 4px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AV Homologación</h1>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${ctx.ownerFullName}</strong>,</p>
      <p>Hemos recibido su pago para la solicitud de homologación.</p>
      <div class="status">
        <p><strong>Número de solicitud:</strong> ${ctx.homologationId}</p>
        <p><strong>Estado actual:</strong> ✓ Pagado - En proceso de aprobación</p>
      </div>
      <p>Su solicitud será revisada y procesada en los próximos días hábiles.</p>
    </div>
    <div class="footer">
      <p>Saludos cordiales,<br>Equipo AV Homologación</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }),

  [HomologationStatus.INCOMPLETE]: (ctx) => ({
    to: ctx.ownerEmail,
    subject: "Documentación Incompleta - AV Homologación",
    body: `
Estimado/a ${ctx.ownerFullName},

Su solicitud de homologación requiere documentación adicional o correcciones.

Número de solicitud: ${ctx.homologationId}
Estado actual: Incompleta

${ctx.reason ? `Motivo: ${ctx.reason}` : ""}

Por favor, ingrese a su cuenta para completar la información requerida.

Saludos cordiales,
Equipo AV Homologación
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f7f7f7; }
    .status { background: #fef3c7; padding: 10px; border-radius: 4px; margin: 15px 0; }
    .reason { background: #fff; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AV Homologación</h1>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${ctx.ownerFullName}</strong>,</p>
      <p>Su solicitud de homologación requiere documentación adicional o correcciones.</p>
      <div class="status">
        <p><strong>Número de solicitud:</strong> ${ctx.homologationId}</p>
        <p><strong>Estado actual:</strong> ⚠ Incompleta</p>
      </div>
      ${ctx.reason ? `<div class="reason"><strong>Motivo:</strong> ${ctx.reason}</div>` : ""}
      <p style="text-align: center;">
        <a href="${APP_URL}/homologaciones/${ctx.homologationId}" class="button">Completar Solicitud</a>
      </p>
    </div>
    <div class="footer">
      <p>Saludos cordiales,<br>Equipo AV Homologación</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }),

  [HomologationStatus.APPROVED]: (ctx) => ({
    to: ctx.ownerEmail,
    subject: "¡Solicitud Aprobada! - AV Homologación",
    body: `
Estimado/a ${ctx.ownerFullName},

¡Felicitaciones! Su solicitud de homologación ha sido APROBADA.

Número de solicitud: ${ctx.homologationId}
Estado actual: Aprobada

Próximos pasos:
- Se procederá a generar su certificado de homologación
- Recibirá instrucciones para la entrega del mismo

Gracias por confiar en AV Homologación.

Saludos cordiales,
Equipo AV Homologación
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #059669; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f7f7f7; }
    .status { background: #d1fae5; padding: 10px; border-radius: 4px; margin: 15px 0; border: 2px solid #059669; }
    .next-steps { background: #fff; padding: 15px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ¡Felicitaciones!</h1>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${ctx.ownerFullName}</strong>,</p>
      <p>Su solicitud de homologación ha sido <strong>APROBADA</strong>.</p>
      <div class="status">
        <p><strong>Número de solicitud:</strong> ${ctx.homologationId}</p>
        <p><strong>Estado actual:</strong> ✓ Aprobada</p>
      </div>
      <div class="next-steps">
        <h3>Próximos pasos:</h3>
        <ul>
          <li>Se procederá a generar su certificado de homologación</li>
          <li>Recibirá instrucciones para la entrega del mismo</li>
        </ul>
      </div>
      <p>Gracias por confiar en AV Homologación.</p>
    </div>
    <div class="footer">
      <p>Saludos cordiales,<br>Equipo AV Homologación</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }),

  [HomologationStatus.REJECTED]: (ctx) => ({
    to: ctx.ownerEmail,
    subject: "Solicitud No Aprobada - AV Homologación",
    body: `
Estimado/a ${ctx.ownerFullName},

Lamentamos informarle que su solicitud de homologación no ha sido aprobada.

Número de solicitud: ${ctx.homologationId}
Estado actual: Rechazada

${ctx.reason ? `Motivo: ${ctx.reason}` : ""}

Si tiene alguna consulta, no dude en contactarnos.

Saludos cordiales,
Equipo AV Homologación
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f7f7f7; }
    .status { background: #fee2e2; padding: 10px; border-radius: 4px; margin: 15px 0; }
    .reason { background: #fff; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Solicitud No Aprobada</h1>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${ctx.ownerFullName}</strong>,</p>
      <p>Lamentamos informarle que su solicitud de homologación no ha sido aprobada.</p>
      <div class="status">
        <p><strong>Número de solicitud:</strong> ${ctx.homologationId}</p>
        <p><strong>Estado actual:</strong> ✗ Rechazada</p>
      </div>
      ${ctx.reason ? `<div class="reason"><strong>Motivo:</strong> ${ctx.reason}</div>` : ""}
      <p>Si tiene alguna consulta, no dude en contactarnos.</p>
    </div>
    <div class="footer">
      <p>Saludos cordiales,<br>Equipo AV Homologación</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }),

  [HomologationStatus.COMPLETED]: (ctx) => ({
    to: ctx.ownerEmail,
    subject: "Proceso Completado - AV Homologación",
    body: `
Estimado/a ${ctx.ownerFullName},

Su proceso de homologación ha sido completado exitosamente.

Número de solicitud: ${ctx.homologationId}
Estado actual: Completado

Su certificado de homologación está listo. 
Por favor, siga las instrucciones recibidas para recogerlo.

Gracias por elegir AV Homologación.

Saludos cordiales,
Equipo AV Homologación
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f7f7f7; }
    .status { background: #d1fae5; padding: 10px; border-radius: 4px; margin: 15px 0; border: 2px solid #059669; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Proceso Completado</h1>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${ctx.ownerFullName}</strong>,</p>
      <p>Su proceso de homologación ha sido completado exitosamente.</p>
      <div class="status">
        <p><strong>Número de solicitud:</strong> ${ctx.homologationId}</p>
        <p><strong>Estado actual:</strong> ✓ Completado</p>
      </div>
      <p>Su certificado de homologación está listo.<br>
      Por favor, siga las instrucciones recibidas para recogerlo.</p>
      <p>Gracias por elegir AV Homologación.</p>
    </div>
    <div class="footer">
      <p>Saludos cordiales,<br>Equipo AV Homologación</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }),
};

export class NotificationService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
    if (!this.isConfigured) {
      console.warn("NotificationService: SMTP not configured. Emails will be logged but not sent.");
    }
  }

  /**
   * Send a notification email for a status change
   */
  async sendStatusNotification(context: NotificationContext): Promise<boolean> {
    const template = EMAIL_TEMPLATES[context.status];

    if (!template) {
      console.log(`No email template for status: ${context.status}`);
      return false;
    }

    const email = template(context);
    return await this.sendEmail(email);
  }

  /**
   * Send an email
   */
  async sendEmail(notification: EmailNotification): Promise<boolean> {
    // Log the email for debugging/development
    console.log("=== EMAIL NOTIFICATION ===");
    console.log(`To: ${notification.to}`);
    console.log(`Subject: ${notification.subject}`);
    console.log(`Body: ${notification.body.substring(0, 200)}...`);
    console.log("=========================");

    if (!this.isConfigured) {
      console.log("SMTP not configured - email logged but not sent");
      return true; // Return true in dev mode to not break the flow
    }

    try {
      // NOTE: Actual email sending would require an SMTP client library
      // For now, we're logging the email. In production, you would use:
      // - Deno's built-in SMTP or a library like denomailer
      // - An email API service like SendGrid, Mailgun, or AWS SES
      //
      // Example with SendGrid API:
      // const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${SENDGRID_API_KEY}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     personalizations: [{ to: [{ email: notification.to }] }],
      //     from: { email: EMAIL_FROM },
      //     subject: notification.subject,
      //     content: [
      //       { type: "text/plain", value: notification.body },
      //       { type: "text/html", value: notification.html },
      //     ],
      //   }),
      // });

      console.log("Email would be sent in production environment");
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }

  /**
   * Get the email template for a status (for testing/preview)
   */
  getTemplate(status: string): ((ctx: NotificationContext) => EmailNotification) | null {
    return EMAIL_TEMPLATES[status] || null;
  }
}

