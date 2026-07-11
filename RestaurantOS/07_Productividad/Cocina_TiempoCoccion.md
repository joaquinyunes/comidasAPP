# 2.6.2 — Tiempo de Cocción como Variable Central

## Descripción
El sistema trata el tiempo de cocción como dato clave: ordena y alerta en función de cuánto tarda cada producto, no solo del orden de llegada. Para pizza, el horno es el cuello de botella.

## Dependencias
- `Producto.tiempoCoccion` (segundos).
- Semáforo de tiempo (ver 2.5.2).

## Contenido
- Cada producto define su tiempo de cocción estimado.
- El pase ordena sugeriendo primero lo que libera el horno más rápido.
- El tiempo de cocción alimenta el semáforo y los tiempos del dueño (2.9).
- Ajuste fino por producto, no global.

## Criterio de validación
- Cada producto tiene tiempo de cocción definido.
- El pase usa ese tiempo para priorizar/alertar.
- El dato alimenta las métricas de 2.9.
