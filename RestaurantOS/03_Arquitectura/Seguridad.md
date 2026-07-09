# Seguridad — RestaurantOS

## Autenticación

- JWT + Refresh Tokens
- Access token: 15 min de vida
- Refresh token: 7 días en Redis
- Token contiene: userId, tenantId, roles[], sucursalId
- 2FA opcional para roles Administrador/Dueño

## Autorización

### RBAC (Role-Based Access Control)

| Rol | Permisos |
|-----|----------|
| Dueño | Todo + configuración + datos salariales |
| Gerente | Todo excepto configuración de tenant |
| Cajero | Caja, pagos, facturación |
| Mozo | Sus mesas, pedidos, cobro |
| Chef | KDS, ver pedidos, marcar estados |
| Bartender | KDS solo bebidas |
| Limpieza | Lista de áreas, marcar completado |
| RRHH | Empleados, turnos, asistencia |
| Marketing | Campañas, cupones, segmentación |

### ABAC (Attribute-Based) - Extensiones

- Un mozo solo ve sus mesas (filtrado por usuario_id)
- Un chef ve solo pedidos de su sucursal
- Un gerente ve toda su sucursal
- Un dueño ve todas sus sucursales

## Multi-tenancy

- PostgreSQL Row-Level Security (RLS)
- Cada query filtra por tenant_id automaticamente
- RLS policies en todas las tablas operativas
- Funcion set_current_tenant() se ejecuta al inicio de cada sesion

## Auditoria

- Tabla audit_log append-only (sin delete)
- Registra: usuario, accion, entidad, entidad_id, valor_anterior, valor_nuevo, timestamp, IP
- Acciones auditadas: login, logout, create, update, delete, cambio_estado, cobro, reembolso
- Retencion minima: 1 ano de logs

## Datos sensibles

- Passwords: bcrypt con salt
- Datos de tarjetas: NUNCA se almacenan (delegar en pasarela)
- Datos salariales: solo rol Dueño/RRHH
- Tokens: nunca en logs ni respuestas de error

## RGPD / Privacidad

- Opt-in explícito para marketing
- Derecho a acceso: cliente puede ver todos sus datos
- Derecho a rectificación: cliente puede actualizar perfil
- Derecho a borrado: soft delete + anonimización de historial
- Consentimiento explícito para cámaras IP
- Registro de todos los consentimientos otorgados

## PCI DSS

- NUNCA manejar datos de tarjetas directamente
- Delegar en procesador certificado (MercadoPago/Stripe)
- Solo almacenar: ultimo digito, tipo de tarjeta, ID de transaccion del procesador

## Seguridad de infraestructura

- HTTPS obligatorio (TLS 1.3)
- Rate limiting en API (100 req/min por tenant)
- Helmet.js en Express/Next.js
- Sanitización de inputs
- CORS configurado por tenant
- Secrets en variables de entorno (nunca en codigo)
