# Resumen de Desarrollo — Semana del 16 al 22 de julio de 2026

## Objetivo
Avanzar con la integración de tiempo real (WebSocket) en los módulos principales de comidasAPP: KDS, menú QR, pagos desde mesa y testing.

## Commits de la semana

### 16 de julio — KDS + WebSocket
- Conectado `kds.tsx` al servidor WebSocket para recibir pedidos nuevos y actualizar estados en tiempo real
- Indicador de conexión visible (🟢 En vivo / 🔴 Desconectado)
- Reconexión automática al desconectarse

### 17 de julio — Menú QR + API
- `menu-pedido.tsx` ahora envía pedidos reales a `POST /api/pedidos` en vez de solo loguear
- Conexión WebSocket para escuchar actualizaciones del estado del pedido desde la mesa
- Manejo de errores y feedback al usuario

### 18 de julio — Pago desde mesa
- Nuevo componente `pago-desde-mesa.tsx` para que el cliente pague directo desde su celular
- Métodos de pago: efectivo, tarjeta y QR
- Cálculo de propina con opciones predefinidas (0%, 5%, 10%, 15%)
- WebSocket para confirmación de pago en tiempo real
- Cálculo de vuelto en efectivo

### 19 de julio — Testing WebSocket
- Nueva librería `websocket-test.ts` con clase `WebSocketTester`
- Funciones para simular pedidos, cambios de estado y pagos
- Función `debugWS()` para usar desde la consola del navegador
- Logging de todos los mensajes entrantes/salientes

### 20 de julio — Menú digital móvil
- Categorías ahora son sticky (se quedan arriba al hacer scroll)
- Botón flotante en móvil que muestra cantidad y total del pedido
- Padding bottom para que el contenido no quede tapado por el botón

### 21 de julio — WebSocket robusto
- Reescritura completa de `src/lib/websocket.ts`
- Clase `WSClient` con reconexión por backoff exponencial + jitter
- Límite de reintentos (10 por defecto) con callback al alcanzar el máximo
- Instancia singleton con `getWSClient()` para uso global
- Sistema de eventos con `on()` y unsubscribe

## Archivos modificados/creados
| Archivo | Acción |
|---------|--------|
| `src/components/kds.tsx` | Modificado |
| `src/components/menu-pedido.tsx` | Modificado |
| `src/components/menu-digital.tsx` | Modificado |
| `src/components/pago-desde-mesa.tsx` | Creado |
| `src/lib/websocket-test.ts` | Creado |
| `src/lib/websocket.ts` | Reescrito |

## Próximos pasos
- Integrar el `WSClient` refactorizado en todos los componentes
- Agregar tests unitarios para la clase `WebSocketTester`
- Deploy a staging para testing end-to-end
