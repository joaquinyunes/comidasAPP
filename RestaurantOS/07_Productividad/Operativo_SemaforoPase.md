# 2.5.2 — Semáforo de Tiempo en el Pase

## Descripción
Cada comanda en el pase de cocina muestra un semáforo por tiempo de espera: verde (ok), amarillo (apretado), rojo (>3-4 min, alerta al dueño). Visualiza la presión sin que nadie pregunte.

## Dependencias
- `PedidoItem` con `horaEnviado` y `estado`.
- Umbrales configurables por producto/tipo.

## Contenido
- Tiempo desde envío a cocina se calcula en vivo.
- Verde/amarillo/rojo según umbral por tipo de producto.
- Al pasar a rojo, el ítem destaca y notifica al dueño/responsable.
- Histórico de tiempos para la micro-fase 2.9.

## Criterio de validación
- El pase muestra semáforo por tiempo en vivo.
- Un ítem > umbral pasa a rojo visible.
- El rojo dispara aviso al responsable.
