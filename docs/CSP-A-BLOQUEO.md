# CSP: de «solo reporte» a «bloquear» (S2) — checklist

**Estado (17/11/2026):** listo para pasar, **todavía no pasado**. Falta juntar reportes con tráfico real (👤). El interruptor y los tests ya están.

## Qué hay hecho
- `src/config/csp.ts`: la política y el interruptor. Variable **`CSP_MODO`**: vacía o `reporte` (hoy) → `Content-Security-Policy-Report-Only` con `report-uri /api/csp`; `bloquear` → una sola cabecera `Content-Security-Policy` con la política completa.
- Es una **variable de build**: Next fija las cabeceras al compilar. Verificado el 17/11/2026 compilando con `CSP_MODO=bloquear` y mirando las cabeceras con `next start` (hay `Content-Security-Policy` completa y **cero** `Report-Only`); sin la variable, queda `frame-ancestors 'none'` + `Report-Only`.
- `tests/csp.test.ts` (4 tests): modo por defecto, forma de las cabeceras en cada modo y que la política no abre `object-src`, `base-uri` ni `'unsafe-eval'`.
- `POST /api/csp` registra `[csp] { directiva, recurso, pagina }` en los logs de Vercel (sin IP, cookies ni cuerpo completo; 30 por minuto por IP).

## Qué NO está resuelto
`script-src` mantiene `'unsafe-inline'` porque Next inyecta scripts en línea. Con `bloquear` eso **no frena un XSS por script en línea**; sí frena cargar scripts, estilos, imágenes o conexiones de **otros orígenes** (salvo `https:` para imágenes), objetos, `<base>` y formularios hacia afuera. Pasar a nonces obliga a render dinámico en todas las páginas y hay que medir el costo (`docs/RENDIMIENTO.md`) antes de adoptarlo.

## Checklist para pasar a bloqueo
1. [ ] Desplegar esta rama (o la demo) con tráfico real y dejarla **7 días** en modo reporte.
2. [ ] En los logs de Vercel buscar `[csp]` y armar la lista de violaciones únicas (directiva + recurso). Esperable: ninguna del propio sitio. Si aparece un origen legítimo (fuente, mapa, analítica), agregarlo **solo** a la directiva que corresponde en `politicaCsp`.
3. [ ] Con las violaciones en cero o resueltas: en Vercel → Settings → Environment Variables, `CSP_MODO=bloquear` (Production) y **redeplegar**.
4. [ ] Recorrer con la consola del navegador abierta, buscando errores `Refused to …` o `Content Security Policy`: portada (`/`), `/menu`, `/nosotros`, `/ordenar` (armar un pedido), `/pedir-local`, `/reservar`, `/login`, `/dashboard` (Salón, Pedidos, Cocina, Caja, Carta), y el pago con Mercado Pago (la redirección sale del sitio: es navegación, no la bloquea la CSP, pero confirmarlo).
5. [ ] Confirmar las cabeceras: `curl -sI https://<dominio>/login | grep -i content-security` debe mostrar una sola `Content-Security-Policy` y ninguna `Report-Only`.
6. [ ] Mirar el 3D de la portada (WebGL y `blob:` para texturas) y las fotos de la carta (URLs `https:` externas).
7. [ ] Si algo se rompe: borrar `CSP_MODO` y redeplegar (vuelve a reporte). Anotar qué se rompió y la violación.

**Criterio de cierre:** 7 días de reporte sin violaciones nuevas, el recorrido completo sin errores de CSP en consola, y las cabeceras confirmadas. Fecha y resultado, abajo.

| Fecha | Quién | Resultado |
|---|---|---|
| _(pendiente)_ | | |
