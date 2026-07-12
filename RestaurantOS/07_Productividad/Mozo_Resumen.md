# 2.7.6 — Resumen de Micro-fase 2.7: El Trabajo del Mozo en el Salón

## Objetivo
Que el mozo controle todo el salón desde una vista, con alertas de alergia, disponibilidad real y botones de ayuda, en vez de correr preguntando.

## Archivos
1. `Mozo_MapaSemaforo.md` — planta con semáforo.
2. `Mozo_AlergiasBloqueante.md` — alerta grande y bloqueante.
3. `Mozo_DisponibilidadTiempoReal.md` — no prometer lo agotado.
4. `Mozo_HistorialMesa.md` — contexto al abrir mesa.
5. `Mozo_AyudaCuenta.md` — urgente / ayuda.
6. Este resumen.

## Valor
El mozo atiende más mesas con menos error y menos idas y vueltas.

## Implementación (estado: ✅)
- **API**: `GET /api/mozo/mapa-semaforo` (mesas + estado + segundos desde cambio), `GET /api/mozo/alergias?mesaId=` (alérgenos del cliente + productos a evitar), `GET /api/mozo/disponibilidad` (platos no disponibles + quiebres de ingrediente), `GET /api/mozo/historial-mesa?mesaId=` (visitas previas), `GET /api/mozo/cuenta?mesaId=` (subtotal + propina sugerida 10%).
- **UI**: `/dashboard/mozo` (`PanelMozo`) con auto-refresh y selección de mesa.
- **Nota**: las alergias se cruzan contra `Cliente.alergenos` y `Producto.alergenos`; la cuenta suma `PedidoItem.subtotal` de pedidos abiertos.
