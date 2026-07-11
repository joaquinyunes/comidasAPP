# 2.21.4 — Clonado de Producto para Otro Rubro

## Descripción (Función 19/20)
Función interna (para vos, no para el cliente final) que toma la base de PizzaFlow y genera una nueva instancia configurada para otro rubro (hamburguesería, café) cambiando solo categorías y flujo de personalización. Reusás la arquitectura para vender más productos.

## Dependencias
- Arquitectura multi-tenant (2.21.1), `Categoria`, `Producto`.

## Contenido
- Generador de instancia nueva desde la base PizzaFlow.
- Plantillas por rubro (pizza, hamburguesa, café) con categorías y flujos.
- Personalización del flujo de armado por rubro.
- La nueva instancia es un tenant independiente.

## Criterio de validación
- Se genera una instancia nueva desde la base.
- La plantilla por rubro cambia categorías/flujo.
- La instancia es un tenant aislado.
