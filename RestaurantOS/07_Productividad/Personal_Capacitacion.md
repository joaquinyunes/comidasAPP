# 2.1.3 — Modo Capacitación (Onboarding Guiado)

## Descripción
Una capa del sistema pensada para que un empleado nuevo aprenda el flujo real sin romper nada: opera en un entorno de práctica con datos de ejemplo y ayudas contextuales, sin afectar ventas ni stock reales.

## Dependencias
- Mismos componentes que el flujo productivo (`kds.tsx`, `pedidos`, `pagos.tsx`) pero en modo `capacitacion=true`.
- Role `EMPLEADO` con flag `enCapacitacion`.

## Contenido
- Al entrar en modo capacitación, el sistema muestra tooltips paso a paso: "tomá el pedido", "enviá a cocina", "marcá listo", "cobrá".
- Las acciones no escriben en ventas reales ni descuentan stock real.
- Un responsable puede revisar la práctica y dar el visto bueno para pasar a modo productivo.
- El mismo modo sirve para probar nuevas funciones antes de soltarlas en el turno.

## Criterio de validación
- En modo capacitación no se modifica ningún dato de producción (ventas, stock, caja).
- El empleado completa un recorrido guiado de pedido→cocina→pago sin errores bloqueantes.
- El responsable puede habilitar/deshabilitar el modo por empleado.
