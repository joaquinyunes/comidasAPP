# Manual del restaurante — Cozizina (V5)

Para el dueño y el equipo. Está escrito sobre lo que el panel hace **hoy** (revisado contra el código el 05/11/2026). Sin capturas de pantalla ni videos todavía: ver «Lo que falta» al final. Lo que no existe está dicho expresamente.

## 1. Entrar y cuidar tu cuenta
1. Entrá a `https://<tu-dominio>/login` con tu mail y la clave que te entregaron.
2. **Primer día:** *Mi cuenta* → cambiá la clave (mínimo **12 caracteres**) y activá la **verificación en dos pasos**: escaneá la clave con una app de códigos (Google Authenticator, Authy, 1Password) y escribí el código de 6 números. Desde ahí, para entrar pide clave + código.
3. Si perdés el celular o una compu: *Mi cuenta* → **Cerrar sesión en todos mis dispositivos**.
4. Si te equivocás 5 veces seguidas, la cuenta se bloquea 15 minutos. Es normal.
5. Olvidé mi clave: «¿Olvidaste tu contraseña?» en el login.
6. La sesión se renueva sola mientras trabajás; si pasa mucho tiempo sin usarla, te pide entrar de nuevo.

## 2. Quién ve qué
Cada persona ve solo el menú que le corresponde. Roles de base: **Administrador** (todo), **Gerente**, **Mozo**, **Cocinero**, **Barman**, **Cajero**. Se crean y desactivan accesos en *Configuración*. Al dar de alta a alguien, la clave inicial también necesita 12 caracteres; pedile que la cambie en *Mi cuenta*.

## 3. El día a día
| Quién | Dónde | Para qué |
|---|---|---|
| Mozo | **Salón** | Ver mesas, abrir pedidos, agregar o quitar ítems, pedir la cuenta |
| Cocina / barra | **Cocina** | Tablero de comandas; marcar cada ítem (en preparación, listo). Si algo se terminó: **Carta** → «No disponible» |
| Cajero | **Pedidos** y **Caja** | Cobrar (efectivo, tarjeta, QR, transferencia), dividir la cuenta, propina. **Caja** muestra el resumen del día por método de pago |
| Quien atiende teléfono | **Reservas** | Ver, confirmar, marcar «en mesa» o «no se presentó» |
| Quien despacha | **Delivery** | Asignar repartidor a un pedido y marcar «en camino» / «entregado» / «fallido» |

**Anular un ítem** queda registrado (motivo, quién y cuándo). **Borrar un ítem** de un pedido también queda registrado.
**Los clientes piden solos** desde el QR de la mesa (`/pedir-local`) o desde `/ordenar` (retiro y delivery) y pueden pagar con Mercado Pago. Si el pago se aprueba, el pedido figura pagado **una sola vez**, aunque Mercado Pago avise dos veces.

## 4. La carta
**Carta** (panel): marcá disponible / no disponible, destacá, cambiá precios (quien tenga permiso). Cada cambio de precio queda en el registro de auditoría. Las fotos de la carta son direcciones (URLs) de imágenes propias del restaurante.

## 5. Inventario y compras
- **Inventario**: stock por ingrediente, con alerta cuando baja del mínimo. Cada pedido descuenta ingredientes según la receta. *Si el descuento falla, el pedido se crea igual:* mirá el stock con regularidad.
- **Compras**: proveedores, órdenes de compra y sugerencia automática de reposición.
- Se registran entradas, salidas, mermas y ajustes con motivo.

## 6. Clientes, equipo y reportes
- **Clientes / Fidelización / Marketing**: ficha, puntos, cupones y campañas.
- **Datos personales (Ley 25.326):** a pedido de un cliente se puede **exportar** sus datos o **anonimizarlos** (borrar nombre, contacto y direcciones; las ventas pasadas siguen contando sin identificarlo). Lo hace una persona con permiso de administración.
- **Equipo** y **Tareas y fichaje**: turnos, entrada y salida, listas de apertura y cierre.
- **Resumen, Control del dueño, Reportes, Tendencias, Opiniones**: ventas, tendencias y calificaciones.

## 7. Lo que el sistema NO hace hoy
- **No hay cierre de caja por turno** (apertura con monto inicial, conteo y diferencia). Hay un resumen del día por método de pago.
- **No emite factura electrónica** ni avisa por WhatsApp (se integran en el paquete Completo).
- **No recibe pedidos de PedidosYa/Rappi** ni de WhatsApp.
- No sigue al repartidor en un mapa.

## 8. Si algo anda mal
| Síntoma | Qué hacer |
|---|---|
| El sitio no abre | Pedí ayuda por el canal de soporte (tiempo de respuesta: ver contrato). El sistema revisa solo si el sitio y la base responden cada 15 minutos |
| Un cliente dice que pagó y no figura | Mirá en Mercado Pago si el pago está *aprobado*; si lo está y no figura en **Pedidos**, avisá a soporte con el número de operación |
| Un pedido figura pagado dos veces | No debería pasar con la protección de pagos; avisá a soporte con el número de pedido |
| Sospechás que alguien usa tu cuenta | *Mi cuenta* → cerrar sesión en todos los dispositivos, cambiar la clave y avisar a soporte |

## 9. Traspaso (para quien entrega el sistema)
Checklist en `docs/DESPLIEGUE-CLIENTE.md`: dominio, cuentas de Vercel / Supabase / Mercado Pago / GitHub **a nombre del cliente**, claves entregadas por canal seguro, backup restaurado al menos una vez y capacitación hecha.

## Lo que falta de este manual
- Capturas de pantalla por pantalla y **PDF corto** (hay que generarlas con datos reales de un cliente, no con datos de ejemplo).
- **Videos de 5 minutos** por flujo clave (tomar un pedido, cobrar, cargar la carta).
- Runbook de caída con los contactos reales de soporte y los tiempos de respuesta contratados.
