# Paquetes y precios de Cozizina (V1) y costo a 3 años (V2)

Fecha de cálculo: **05/11/2026**. Los precios de Cozizina son una **propuesta a validar con un comprador real** (no son un dato de mercado). Los de terceros están leídos de las fuentes que se citan, con la fecha en que se leyeron. Para recalcular con otros números: `node scripts/tabla-3-anios.mjs <ventas por apps en ARS por mes>` (las entradas están al principio del script).

## V1 — Tres paquetes

| Paquete | Precio (propuesta) | Qué incluye | Qué NO incluye |
|---|---|---|---|
| **Instalación** | USD 3.500 único | Base de datos y dominio propios, carta y datos reales cargados, usuarios y roles, capacitación del equipo (2 sesiones), despliegue en Vercel + Supabase a nombre del cliente | Integraciones de pago/WhatsApp/factura, migración de datos de otro sistema, mantenimiento |
| **Mensual** | USD 120 por mes | Hosting (Vercel Pro + Supabase Pro, ≈ USD 45 al costo), backups semanales con prueba de restauración, actualizaciones de seguridad, soporte por escrito con respuesta en 1 día hábil (urgencias de caída: 4 h hábiles) | Cambios de diseño, funciones nuevas, capacitación adicional |
| **Completo** | **USD 10.000** único | Instalación + integraciones locales (Mercado Pago con webhook firmado, aviso de pedido por WhatsApp, factura electrónica con proveedor certificado) + migración de los datos del cliente + **12 meses de Mensual incluidos** (valor USD 1.440) | Costos de terceros a nombre del cliente (comisión de Mercado Pago, WhatsApp Business, proveedor de facturación) |

Condiciones para ofrecer el Completo (del veredicto del tribunal): producción real andando, backup restaurado al menos una vez (`docs/BACKUPS.md`), mantenimiento mensual contratado y soporte escrito. **Hoy no se cumplen todas** (ver `docs/PENDIENTES-VENTA.md`): no se puede ofrecer todavía.

Notas de costo para quien vende (no para el cliente):
- Supabase Pro: desde USD 25/mes, backups diarios con 7 días de retención; el plan gratuito pausa el proyecto tras 1 semana sin uso y **no tiene backups** (supabase.com/pricing, leído 05/11/2026).
- Vercel Pro: USD 20/mes por usuario con 20 USD de crédito de uso; el plan Hobby es solo para uso **no comercial** (vercel.com/pricing, leído 05/11/2026). Un restaurante real necesita Pro.
- Precios sin impuestos.

## V2 — Costo total a 3 años (36 meses)

### Lo que cuesta cada alternativa
| Alternativa | Precio de entrada | Fuente y fecha |
|---|---|---|
| **Fudo** plan Avanzado (stock, recetas, clientes, reportes, pedido por QR en mesa) | ARS 43.900/mes | fu.do/precios, leído 05/11/2026; precio final con impuestos |
| Fudo módulo Facturación electrónica | ARS 13.500/mes | ídem |
| Fudo módulo Gestión de mesas | ARS 8.500/mes | ídem |
| Fudo módulo Apps de delivery (recibir pedidos de las apps en Fudo) | ARS 19.500/mes (no incluido en la cuenta) | ídem |
| Descuento de Fudo por pagar por adelantado | 10 % semestral, 15 % anual | ídem (la página no dice hasta cuándo valen estos precios) |
| **PedidosYa** | 20–30 % del pedido (plan básico ≈ 20 %; más visibilidad, 28–30 %), más costo de pago online | developargentina.com, 24/03/2026. **Fuente comercial** (vende apps propias) y sin cita; no es una tarifa publicada por PedidosYa. Un restaurante con contrato debe usar el suyo |
| **Rappi** | 18–28 % del pedido | ídem |
| **Cobrar con Mercado Pago** en el canal propio | 1,49 % a 6,29 % + IVA según plazo de acreditación (la acreditación inmediata es la más cara) | Comparador de terceros (spomsolutions.com, 2026); el sitio oficial de Mercado Pago bloqueó la lectura. Confirmar en el panel de la cuenta del cliente |
| Tipo de cambio de referencia | ARS 1.565 por USD (dólar blue, venta) | Bloomberg Línea, 29/09/2026: **tiene más de un mes, reemplazar por el del día** |

### Costo a 36 meses (en USD, al cambio de referencia)
| Opción | Cuenta | Total |
|---|---|---|
| **Fudo** Avanzado + Facturación + Mesas, pagando por mes | ARS 65.900 × 36 = ARS 2.372.400 | **≈ USD 1.516** |
| Fudo, pagando por año (−15 %) | | ≈ USD 1.289 |
| **Cozizina Instalación + Mensual** | 3.500 + 120 × 36 | **USD 7.820** |
| **Cozizina Completo** | 10.000 (incluye 12 meses) + 120 × 24 | **USD 12.880** |
| Apps de delivery | sin cuota fija; 20 % de cada pedido | depende de las ventas (abajo) |

**Lectura honesta:** contra Fudo, Cozizina cuesta **entre 5 y 10 veces más** a 3 años. No se vende por precio de software. Hay dos diferencias que lo pueden justificar y que hay que demostrar con un cliente real:
1. **Sin comisión por pedido.** Si el restaurante hoy vende por apps y logra pasar ventas a su canal propio, ahorra la comisión de la app menos el costo de cobrar con Mercado Pago. Con 20 % de comisión y 3 % de costo de cobro, cada USD 1.000 que se mueven al canal propio ahorran USD 170.
2. **Dueño de sus datos y de su carta**, y a medida (que Fudo no ofrece), pero eso no tiene precio en esta tabla.

### Punto de equilibrio (Completo contra Fudo)
Con los supuestos de arriba, el Completo empata con Fudo a 3 años si el restaurante **mueve al canal propio unos USD 1.900 por mes (≈ ARS 2,96 millones) de ventas que hoy paga a una app**. Con 3 millones de pesos por mes movidos, ahorra ≈ USD 326/mes (≈ USD 11.700 en 3 años). Por debajo de esa cifra, Fudo es más barato. Si el restaurante no vende por apps, **no hay argumento económico** y conviene decírselo.

### Qué cambia el resultado
- **Inflación:** los precios de Fudo están en pesos y van a subir en 3 años; los de Cozizina están en dólares. La tabla usa los precios de hoy (piso para Fudo).
- Comisión real del contrato con la app (el 20 % es un supuesto de una fuente comercial).
- Costo de cobrar con Mercado Pago (1,49 % a 6,29 %): se resta del ahorro.
- Si el cliente ya usa Fudo, Cozizina puede ofrecerse solo como canal de pedidos propio (Instalación + Mensual) y la comparación es otra.

### Qué no se verificó
- Fudo: los precios son los de su página; no se verificó que la página sea la de Argentina por otra vía ni si hay promociones, ni se probó el producto.
- PedidosYa/Rappi: no hay tarifa oficial publicada; las cifras son de un blog comercial.
- Mercado Pago: tarifa de un comparador de terceros.
- Los precios de Cozizina no fueron validados con ningún comprador.
