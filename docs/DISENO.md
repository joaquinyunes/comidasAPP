# Revisión de diseño y accesibilidad (WCAG 2.1 AA) — Cozizina

Fecha: 2026-10-31 · Rama: `feat/diseno-a11y` (base `master`) · Alcance: **mejorar sin rediseñar**
(héroe 3D, paleta pop amarillo/morado/rojo, Anton/Poppins y bordes duros quedan igual).
Método: Next en local (`next dev`, sin base de datos: `/api/publico/landing` responde 500 y la landing usa sus datos por
defecto), navegador integrado a 375 px, script de medición del DOM (h1, controles visibles < 44 px, campos sin etiqueta,
imágenes sin `alt`, desborde) y lectura del código con `web-design-guidelines`, `design:accessibility-review`,
`design:design-critique` y `design:ux-copy`.

## Medición a 375 px (controles menores de 44 px / total)

| Página | `<h1>` | Controles < 44 px antes → después |
|---|---|---|
| `/` | 1 | 18 de 52 → 0 de 52 |
| `/menu` | 1 | 3 de 14 → esperado 1 (solo queda el enlace dentro de una frase, ver #7); no se volvió a medir tras el cambio |
| `/nosotros` | 1 | 2 de 13 → 0 |
| `/ordenar` | 1 | 2 de 14 → 0 |
| `/reservar` | 1 | 2 de 19 → 0 |
| `/login` | 1 | 1 de 4 → 0; **2 campos sin etiqueta → 0** |

Sin imágenes sin `alt` y sin desborde horizontal en ninguna página medida. Los botones "Ver … en tu mesa" y el enlace
"Horarios completos" miden 42 px mientras la tarjeta hace su animación de entrada (`reveal-scale` a 0,95); en reposo son 44 px.
Peso: los cambios son ~50 líneas de CSS y marcado; no se agregó JS ni dependencias (build de producción OK).

## Hallazgos

| # | Prio | Hallazgo | Evidencia | Estado |
|---|---|---|---|---|
| 1 | Alta | Login: los dos campos tenían un `<label>` visual pero sin `for`/`id` (el lector de pantalla los anunciaba vacíos) | `src/app/login/page.tsx`; medición: `sinEt` 2 | Corregido (`htmlFor`/`id`, `autoComplete`) |
| 2 | Alta | Puntos de los sliders (`.galaxy-dot`) de 14 px (testimonios y "galaxia") | `src/styles/galaxy-slider.css`; medición | Corregido: área de 44 px, el punto visible sigue de 14 px (fondo del content-box + aro con `::after`) |
| 3 | Alta | "Ver … en tu mesa" 40 px, "Ir directo a la carta" 17 px, "Horarios completos" 23 px, "Términos/Privacidad" 17 px, "¿Olvidaste tu contraseña?" 16 px (11 px de letra) | `camara.css`, `hero3d.css`, `where.css`, `globals.css` (`.pop-footer-fine a`), login | Corregido |
| 4 | Alta | Foco de teclado: solo `.pop-btn`, la carta y el panel tenían estilo; el resto (enlaces del menú, pie, sliders) dependía del contorno del navegador, invisible sobre fondos oscuros | `globals.css` | Corregido: `:where(...):focus-visible` aro negro + aro amarillo (especificidad 0: no pisa los anillos de shadcn/Tailwind ni el del panel) |
| 4b | Media | Textos de error del login: "Credenciales inválidas" / "Error de conexión" sin salida; el bloque de error sin `role="alert"` | login | Corregido: "El email o la contraseña no coinciden. Revisalos y probá de nuevo." / "No pudimos conectarnos. Revisá tu internet y probá de nuevo." + `role="alert"`; íconos decorativos `aria-hidden` |
| 5 | Media | Animaciones decorativas del login (`animate-pulse`, `fadeIn`) sin `motion-reduce` | login | Corregido |
| 6 | **Decisión de producto** | La landing **ignora** `prefers-reduced-motion` a propósito: `prefersReducedMotion()` devuelve siempre `false` (`src/components/landing/animations/gsap-client.ts`) porque muchos celulares lo traen activo por ahorro de batería y dejaban el sitio plano y sin 3D. Los testimonios rotan solos cada 5 s sin botón de pausa | `gsap-client.ts`, `testimonials.tsx:86` | **No se tocó** (conservar el héroe 3D era parte del alcance). Recomendación: mantener el 3D pero que `prefers-reduced-motion` frene la rotación automática y los bucles `infinite`, o agregar un botón "Pausar" (WCAG 2.2.2) |
| 7 | Baja | Enlaces dentro de una frase ("hacé tu pedido" en `/menu`, "Horarios completos"): menores de 44 px | `CartaEstados.tsx:18` | No se cambió (los enlaces en línea están exentos del tamaño mínimo) |
| 8 | Baja | `.cam-boton-miniatura` (insignia de cámara sobre la miniatura) de 28 px | `camara.css:424`, `carta-tarjeta.css:83` | Pendiente: pisa la foto de la miniatura; requiere decisión visual. `carta-tarjeta.css` además tiene cambios sin commitear de otra sesión en la copia principal |
| 9 | Baja | La landing consulta `/api/publico/landing` y, si falla, muestra datos por defecto sin avisar | log de `next dev` (500 sin BD) | Pendiente: mostrar un aviso/estado vacío si el menú queda con datos de ejemplo |
| 10 | Baja | Páginas del panel (`/dashboard/*`), `/cliente`, `/pedir-local`, `/recuperar` no se midieron (requieren sesión/BD) | — | Pendiente |

## Lo que se conservó a propósito
Héroe 3D y viaje de scroll (GSAP/three.js), paleta pop, tipografías, bordes y sombras duras, textos de marca.

## No verificado
- Páginas con sesión o base de datos (panel, cliente, pedido en mesa): no hay `.env` en la copia aislada ni BD.
- Lector de pantalla real y contraste sobre las capas 3D.
- `prefers-reduced-motion` en la landing (ver #6): el navegador integrado lo emula activo, y aun así la landing anima por la decisión de producto.
- `eslint src/app/login/page.tsx` pasa sin avisos; `tsc`, los 354 tests y `next build` pasan.
