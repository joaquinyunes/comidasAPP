# Back-office de Cozizina contra Fudo (WP-24) — stock de insumos, delivery y despacho, caja por turno

Fecha: 05/11/2026. **Qué es y qué no es:** una tabla de brechas para decidir qué construir o integrar. «Fudo» se lee de su propia página (fu.do, leída el 05/11/2026): son afirmaciones comerciales del proveedor, **no probé su producto** ni vi precios (la página no los publica). «Cozizina hoy» está verificado en el código de esta rama (`feat/venta-10k`), no en producción.

Regla de la skill `backend-por-nicho`: en gastronomía el sistema que ya se usa es Fudo; antes de construir algo que Fudo ya resuelve, decidir si conviene **integrarlo** o **construirlo para vender sin comisión**. Esa decisión es del dueño (👤, ver al final).

## 1. Stock de insumos

| | Fudo (según su sitio) | Cozizina hoy |
|---|---|---|
| Descuento automático por pedido | Sí, por receta (y por porción según el negocio) | **Sí**: `descontarStock` por receta al crear pedido (mesa, local y delivery). Si falla, el pedido igual se crea y solo se registra el error (`console.error`) → el stock puede quedar desfasado sin aviso |
| Qué hay / qué falta / qué se pierde | Sí | Stock por sucursal y lote con vencimiento; movimientos `entrada/salida/ajuste/merma/transferencia`; alerta de stock bajo (notificación) |
| Costo de recetas | Calcula automáticamente | Hay `costoUnitario` por ingrediente y `costo` por producto en la base; **no hay reporte** de costo de receta ni margen |
| Compras a proveedores | (no figura en la página) | Proveedores, órdenes de compra y sugerencia automática de reposición |
| Importar menú e insumos al migrar | Sí | **No** (carga manual o seed) |

**Brechas, de mayor a menor valor para el comprador:**
1. Reporte de **costo de receta y margen por producto** (los datos ya existen; falta cálculo + pantalla).
2. Que el fallo del descuento de stock **no sea silencioso** (aviso en el panel o reintento).
3. **Importador** de carta e insumos desde planilla (CSV) para instalar rápido en un cliente nuevo (V4).
4. Conteo físico / inventario periódico con ajuste (hoy solo hay movimientos de «ajuste» sueltos).

## 2. Delivery y despacho

| | Fudo (según su sitio) | Cozizina hoy |
|---|---|---|
| Tienda online propia | Sí | **Sí**: `/ordenar` (delivery y retiro) con zonas, costo de envío y tiempo estimado, pago por MercadoPago |
| Pedidos por WhatsApp (chatbot) | Sí | **No** |
| Pedidos de apps de delivery en el mismo sistema | Sí | **No** (no hay integración con PedidosYa/Rappi) |
| Repartidores | «A demanda»: al marcar el pedido listo, un repartidor lo retira | Zonas de reparto, **asignación manual** de repartidor (empleado) a un pedido, estados `asignado → en_camino → entregado` (o `fallido`) con hora de salida y entrega, panel de seguimiento |
| Ruteo / seguimiento del repartidor | La página no lo detalla | **No** (sin mapa ni ubicación en vivo; `ZonaReparto.poligono` existe pero no se usa para validar direcciones) |
| «Sin comisión del 30 %» | Lo afirma de su delivery | **Sin comisión por pedido** (es el argumento de venta de `PLAN-VENTA-10K.md`, a validar) |

**Brechas:**
1. **Avisar al cliente** el estado de su pedido por WhatsApp (requiere credenciales de WhatsApp Business, 👤) — es el foso de integración local del tribunal.
2. Validar que la dirección cae dentro de una zona (usar el polígono ya guardado).
3. Asignación semiautomática (sugerir al repartidor libre) — baja prioridad para un solo local.
4. Entrada de pedidos de apps: solo si el piloto lo pide; son integraciones de terceros con contrato.

## 3. Reportes de caja por turno

| | Fudo (según su sitio) | Cozizina hoy |
|---|---|---|
| Cierre de caja al terminar el turno | «Casi listo», con conciliación automática | **No hay flujo de apertura/cierre**: existe la tabla `Caja` (monto inicial, final, diferencia, cajero) pero **ninguna ruta la abre ni la cierra**; los pagos solo pueden apuntar a una caja si el cliente envía `cajaId` |
| Arqueo | Sí | `GET /api/caja/resumen?fecha=`: pagos del **día calendario** por método, propinas y cantidad — no por turno ni por cajero |
| División de cuentas y propinas | Sí | **Sí**: pago parcial (dividir la cuenta) y porcentaje de propina |
| Factura electrónica (ARCA) | Vinculada a cada venta | **No** (backend-por-nicho: integrar con proveedor certificado; cuenta y credenciales 👤) |
| Anulaciones auditadas | (no figura) | Sí: motivo, quién y cuándo (`Anulacion` + auditoría) |

**Brechas (es la más importante de las tres):**
1. **Abrir caja** (monto inicial, cajero) y **cerrar caja** (monto contado vs esperado → `diferencia`), asociando automáticamente cada pago a la caja abierta. Sin esto «reporte de caja por turno» no existe.
2. Reporte del turno: ventas por método y por canal (mesa/retiro/delivery), propinas, anulaciones y diferencia, imprimible.
3. Factura electrónica: integrar un proveedor, no construirla (Orbe ya definió `FacturacionProvider`, reutilizar el patrón).

## 4. Orden sugerido para construir (si se decide competir con Fudo)
1. Apertura/cierre de caja + reporte por turno (2 de arriba) — lo que un dueño mira cada noche.
2. Costo de receta y margen por producto.
3. Aviso del estado del pedido por WhatsApp.
4. Importador CSV (acelera el despliegue repetible V4).
5. Factura electrónica con proveedor certificado (junto con el paquete «Completo», V1).

## 5. Límites de este documento
- Fudo: solo su página comercial; no se probó la prueba gratuita, no se leyeron precios ni comisiones (V2 tiene que tomarlos del sitio el día que se arme la tabla) ni se verificó cómo funciona cada cosa. Hay reseñas mixtas de atención al cliente en sitios de terceros (Capterra), sin contrastar.
- Cozizina: leído en el código; no se ejecutó contra una base real ni se probó el flujo de punta a punta.
- No cubre RRHH (turnos de empleados, fichaje) ni fidelización, que Cozizina sí tiene.

## 6. Decisión pendiente (👤)
¿Se construye lo de las secciones 1–3 o se **integra Fudo** y Cozizina se vende como «carta, pedidos y delivery propios» (la frase de venta actual)? Con esa respuesta se ordena el trabajo siguiente; hasta entonces el plan solo documenta las brechas.
