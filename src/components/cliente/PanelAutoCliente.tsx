"use client";

import { useEffect, useRef, useState } from "react";
import { useCarrito, type ItemMenu } from "./useCarrito";
import { useEstadoPedido } from "./useEstadoPedido";
import { enviarPedido, nuevaClave } from "./enviarPedido";
import MenuMesa from "./MenuMesa";
import SeguimientoPedido from "./SeguimientoPedido";

interface Categoria {
  categoria: string;
  items: ItemMenu[];
}

// Orquestador: decide si mostrar el menú o el seguimiento. La
// lógica de carrito, envío y polling vive en módulos separados.
export default function PanelAutoCliente({ mesaId }: { mesaId: string }) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cupon, setCupon] = useState<{ codigo: string; descuento: number } | null>(null);
  const claveRef = useRef<string>(nuevaClave());

  const catalogo = categorias.flatMap((c) => c.items);
  const carrito = useCarrito(catalogo);
  const estado = useEstadoPedido(pedidoId);

  useEffect(() => {
    let vivo = true;
    fetch(`/api/cliente/menu?mesaId=${mesaId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("menu"))))
      .then((d) => {
        if (vivo) setCategorias(d.data ?? []);
      })
      .catch(() => {
        if (vivo) setError("No pudimos cargar el menú. Actualizá la página.");
      });
    return () => {
      vivo = false;
    };
  }, [mesaId]);

  async function onEnviar() {
    if (carrito.totalItems === 0) return;
    setEnviando(true);
    setError(null);
    const r = await enviarPedido(
      mesaId,
      carrito.lineas.map((l) => ({ productoId: l.productoId, cantidad: l.cantidad })),
      claveRef.current,
      cupon?.codigo
    );
    setEnviando(false);
    if (r.ok && r.pedidoId) {
      setPedidoId(r.pedidoId);
      carrito.vaciar();
      setCupon(null);
    } else {
      setError(r.faltantes?.length ? `${r.mensaje} (${r.faltantes.join(", ")})` : r.mensaje);
    }
  }

  function nuevoPedido() {
    claveRef.current = nuevaClave();
    setPedidoId(null);
    setError(null);
    setCupon(null);
  }

  if (pedidoId) {
    return <SeguimientoPedido pedidoId={pedidoId} estado={estado} onNuevoPedido={nuevoPedido} />;
  }

  return (
    <MenuMesa
      mesaId={mesaId}
      categorias={categorias}
      cantidades={carrito.cantidades}
      onCambiar={carrito.cambiar}
      totalItems={carrito.totalItems}
      totalMonto={carrito.totalMonto}
      cupon={cupon}
      onAplicarCupon={(codigo, descuento) => setCupon({ codigo, descuento })}
      onQuitarCupon={() => setCupon(null)}
      enviando={enviando}
      error={error}
      onEnviar={onEnviar}
    />
  );
}
