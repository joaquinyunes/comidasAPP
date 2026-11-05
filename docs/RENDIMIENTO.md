# Rendimiento en celular (WP-42)

Medido en el navegador integrado a 375 px. "Antes" = producción (`cozizina.vercel.app`, 31/10/2026); "después" = `next build && next start` local de esta rama.
Bytes = `encodedBodySize` de `performance.getEntriesByType('resource')` + documento.

| Portada `/` | Antes | Después |
|---|---|---|
| Pedidos | 28 | 29 |
| Bytes | 1,61 MB | ≈ 0,89 MB |
| Texturas del hero 3D | 1,35 MB (versiones de 1100 px) | 0,43 MB (6 × `-m.webp` de 640 px) |
| `loadEventEnd` | 3,7 s (producción) | 2,2 s (localhost, sin red real: no comparable) |

Nota de método: en la medición "después" las texturas ya estaban en caché (recarga), así que sus 0,43 MB se suman por el tamaño de archivo; el resto (459 KB) es lo medido.

## Qué cambió

- `public/assets/3d/*-m.webp` (nuevos, ffmpeg, 640 px de ancho, con alfa): hero-galaxy-bite, hero-hyperdog, pizzanaut, meteor-empanada, comet-fries y nebula-soda (copia, ya era de 344 px).
- `hero3d/sticker-layout.ts`: `srcParaPantalla(src, ancho)` elige `-m.webp` bajo 768 px; `create-hero-scene.ts` lo usa al cargar cada sticker. Test en `tests/hero3d-camera-path.test.ts`.
- `hero3d/has-webgl.ts`: con `navigator.connection.saveData` devuelve `false` → `useHeroMode` cae al hero estático y no se descarga three.js (~136 KB) ni las texturas.
- Se mantiene el 3D en celular (decisión del commit "hero 3D siempre activo en celular"): solo se achica el peso.

## Activos más pesados (antes)

1. Texturas 3D: `hero-hyperdog` 393 KB, `hero-galaxy-bite` 384 KB, `pizzanaut` 211 KB.
2. JS: chunk de three.js 139 KB, otros 70/45/43 KB.
3. `public/assets/*.png` (hasta 1,9 MB c/u: pizzanaut, hyperdog, galaxy-bite, galerías) no entran en la carga de la portada; las páginas que los usan pasan por `next/image` (AVIF/WebP) — no medí esas rutas.

## Verificado y no verificado

- ✔ `tsc --noEmit`, `vitest` (355 de 355) y `next build` en verde.
- ✘ Los productos del recorrido (pizzanaut, meteor, fries, nebula) se siguen pidiendo al arrancar, aunque se ven más adelante en el scroll; diferirlos es el siguiente paso.
- ✘ No probé la calidad visual en un celular real (640 px a 375 px CSS × DPR 2 deja ~1,7 px/px de sobra, pero no lo vi en pantalla).
- ✘ Sin throttling de red: "menos de 3 s" no está confirmado en un celular real; por bytes (≈0,9 MB) debería cumplirlo.
- Las rutas `/menu`, `/ordenar`, etc. no se midieron.

## Medición con red y CPU limitadas (Z7, 05/11/2026)
Método: `next build` + `next start` de la rama `feat/venta-10k`, Chromium (Playwright) a 375 px con **Slow 4G** (1,6 Mbps bajada, 750 kbps subida, 150 ms de latencia), **CPU 4× más lenta** y caché desactivada. Base de datos inexistente: la API responde 500 y las páginas usan sus estados de error/datos de ejemplo. Una carga por ruta; tiempos en ms.

| Ruta | FCP | LCP | `load` | Pedidos | KB (comprimido) |
|---|---|---|---|---|---|
| `/` (hero estático medido primero) | 2044 | 2044 | 2433 | 32 | 327 |
| `/` (WebGL activo, texturas 3D cargadas, 4 s después) | — | 1444 | 2152 | — | 682 |
| `/menu` | 1304 | 1304 | 2131 | 32 | 330 |
| `/ordenar` | 1056 | 1056 | 1688 | 28 | 310 |
| `/nosotros` | 1124 | 1124 | 2576 | 31 | 412 |
| `/reservar` | 1256 | 1256 | 1658 | 25 | 290 |
| `/login` | 2136 | 2136 | 1685 | 21 | 234 |

**Resultado: las 6 rutas cargan (`load`) en menos de 3 s y el LCP queda ≤ 2,1 s (objetivo V9: < 2,5 s) con ese perfil.**

Límites de esta medición: es localhost (sin la latencia real de Vercel ni arranques en frío, que pueden sumar segundos si la función está dormida); una sola corrida por ruta, sin mediana; Chromium de escritorio con CPU limitada, no un celular real; con datos reales de la carta (fotos de productos) la portada pesará más; **no se re-midió producción** (`cozizina.vercel.app` sigue con la versión anterior). Lighthouse no se corrió (V9 sigue abierto).
