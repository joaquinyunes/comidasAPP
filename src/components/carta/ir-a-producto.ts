// Lleva la vista hasta la tarjeta de un producto y la "destella" un momento.
export function irAProducto(id: string): void {
  try {
    const el = document.getElementById(`prod-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.setAttribute("data-destello", "1");
    window.setTimeout(() => el.removeAttribute("data-destello"), 2200);
  } catch {
    // decorativo: si falla, la carta sigue usable
  }
}
