// ============================================
// SERVICIO DE NOTIFICACIONES
// ============================================

export type TipoNotificacion = "pedido" | "stock" | "reserva" | "sistema" | "alerta" | "promo";
export type CanalNotificacion = "push" | "email" | "whatsapp" | "sms" | "in_app";

export interface Notificacion {
  id: string;
  tenantId: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  canal: CanalNotificacion;
  destinatario: string;
  metadatos?: Record<string, unknown>;
  estado: "pendiente" | "enviada" | "leida" | "fallida";
  createdAt: Date;
  readAt?: Date;
}

// ============================================
// SERVICIO EMAIL (templates)
// ============================================

export class EmailService {
  static async enviar(data: {
    to: string;
    subject: string;
    template: string;
    data: Record<string, unknown>;
  }): Promise<boolean> {
    // En producción: usar SendGrid, Resend, o SES
    console.log(`📧 Email enviado a ${data.to}: ${data.subject}`);
    return true;
  }

  // Templates predefinidos
  static templates = {
    bienvenida: (nombre: string) => ({
      subject: `¡Bienvenido a ${nombre}!`,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #DC2626;">¡Hola ${nombre}!</h1>
          <p>Tu cuenta ha sido creada exitosamente.</p>
          <p>Ya podés empezar a usar la plataforma.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Ir al Dashboard
          </a>
        </div>
      `,
    }),

    pedidoConfirmado: (pedidoId: string, total: number) => ({
      subject: `Pedido #${pedidoId} confirmado`,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16A34A;">✅ Pedido confirmado</h1>
          <p>Tu pedido #${pedidoId} ha sido recibido.</p>
          <p><strong>Total: $${total.toLocaleString("es-AR")}</strong></p>
          <p>Te notificaremos cuando esté listo.</p>
        </div>
      `,
    }),

    pedidoListo: (pedidoId: string) => ({
      subject: `Pedido #${pedidoId} listo para retirar`,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #DC2626;">🍳 Tu pedido está listo</h1>
          <p>El pedido #${pedidoId} ya podés retirarlo.</p>
        </div>
      `,
    }),

    reservaConfirmada: (fecha: string, hora: string, personas: number) => ({
      subject: `Reserva confirmada`,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563EB;">📅 Reserva confirmada</h1>
          <p>Tu reserva ha sido confirmada:</p>
          <ul>
            <li><strong>Fecha:</strong> ${fecha}</li>
            <li><strong>Hora:</strong> ${hora}</li>
            <li><strong>Personas:</strong> ${personas}</li>
          </ul>
        </div>
      `,
    }),

    stockBajo: (ingrediente: string, cantidad: number) => ({
      subject: `⚠️ Stock bajo: ${ingrediente}`,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #EA580C;">⚠️ Alerta de stock</h1>
          <p>El ingrediente <strong>${ingrediente}</strong> tiene stock bajo.</p>
          <p>Cantidad actual: <strong>${cantidad}</strong></p>
          <p>Se recomienda realizar un pedido de reposición.</p>
        </div>
      `,
    }),

    reporteDiario: (ventas: number, pedidos: number) => ({
      subject: `📊 Reporte diario - ${new Date().toLocaleDateString("es-AR")}`,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7C3AED;">📊 Reporte del día</h1>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px;">
            <p><strong>Ventas totales:</strong> $${ventas.toLocaleString("es-AR")}</p>
            <p><strong>Pedidos:</strong> ${pedidos}</p>
            <p><strong>Ticket promedio:</strong> $${(ventas / pedidos).toLocaleString("es-AR")}</p>
          </div>
        </div>
      `,
    }),
  };
}

// ============================================
// SERVICIO PUSH NOTIFICATIONS (Web Push)
// ============================================

export class PushService {
  static async registrarSuscripcion(
    userId: string,
    subscription: PushSubscription
  ): Promise<boolean> {
    // En producción: guardar suscripción en DB
    console.log(`🔔 Suscripción push registrada para usuario ${userId}`);
    return true;
  }

  static async enviarPush(userId: string, data: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
  }): Promise<boolean> {
    // En producción: usar web-push library
    console.log(`🔔 Push enviado a ${userId}: ${data.title}`);
    return true;
  }

  static async enviarPushATodos(tenantId: string, data: {
    title: string;
    body: string;
  }): Promise<boolean> {
    // En producción: enviar a todos los suscriptores del tenant
    console.log(`🔔 Push masivo en tenant ${tenantId}: ${data.title}`);
    return true;
  }
}

// ============================================
// SERVICIO WHATSAPP (Cloud API)
// ============================================

export class WhatsAppService {
  static async enviarMensaje(telefono: string, mensaje: string): Promise<boolean> {
    // En producción: usar WhatsApp Cloud API
    console.log(`💬 WhatsApp enviado a ${telefono}`);
    return true;
  }

  static async enviarConfirmacionPedido(telefono: string, pedidoId: string): Promise<boolean> {
    return this.enviarMensaje(
      telefono,
      `✅ Tu pedido #${pedidoId} ha sido confirmado. Te notificaremos cuando esté listo.`
    );
  }

  static async enviarPedidoListo(telefono: string, pedidoId: string): Promise<boolean> {
    return this.enviarMensaje(
      telefono,
      `🍳 Tu pedido #${pedidoId} está listo para retirar. ¡Te esperamos!`
    );
  }
}

// ============================================
// SERVICIO SMS (Twilio)
// ============================================

export class SMSService {
  static async enviarSMS(telefono: string, mensaje: string): Promise<boolean> {
    // En producción: usar Twilio
    console.log(`📱 SMS enviado a ${telefono}`);
    return true;
  }
}
