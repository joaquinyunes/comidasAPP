<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Convenciones de código (este proyecto)

- **Un archivo, una responsabilidad.** Nada de módulos "cajón de sastre" con funciones no relacionadas.
- **Funciones chicas, puras, de un solo propósito.** No agrupar funciones sin relación en el mismo archivo.
- **Aislamiento de fallos:** toda operación con efecto (paso de un handler, fetch, cálculo, emisión de socket, escritura a BD) va envuelta para que un error quede contenido y no arrastre al resto. Límites explícitos.
- **Frontend:** componentes chicos y poco acoplados; un componente hace una sola cosa. No mezclar responsabilidades en una página/componente.
- Preferir muchos archivos finos antes que pocos archivos gordos.
