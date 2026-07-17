"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import type { Producto, CategoriaMenu } from "@/types";

// ============================================
// MENÚ DIGITAL COMPLETO CON PEDIDO
// ============================================

interface MenuPedidoProps {
  categorias: CategoriaMenu[];
  mesaNumero?: string;
}

export function MenuPedido({ categorias, mesaNumero }: MenuPedidoProps) {
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [pedido, setPedido] = useState<Map<string, { producto: Producto; cantidad: number; notas: string }>>(new Map());
  const [productoNotas, setProductoNotas] = useState<string>("");
  const [productoNotasId, setProductoNotasId] = useState<string | null>(null);
  const [showResumen, setShowResumen] = useState(false);
  const [pedidoEstado, setPedidoEstado] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const categoriasFiltradas = categoriaActiva
    ? categorias.filter((c) => c.id === categoriaActiva)
    : categorias;

  useEffect(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws/pedidos`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (mesaNumero) {
          ws.send(JSON.stringify({ tipo: "suscribir", mesaNumero }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.tipo === "pedido:actualizado" && msg.mesaNumero === mesaNumero) {
            setPedidoEstado(msg.estado);
          }
        } catch {}
      };

      ws.onclose = () => {
        setTimeout(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) {
            wsRef.current = new WebSocket(`${protocol}//${window.location.host}/ws/pedidos`);
          }
        }, 5000);
      };
    } catch {}

    return () => {
      wsRef.current?.close();
    };
  }, [mesaNumero]);

  const total = useMemo(() => {
    return Array.from(pedido.values()).reduce(
      (sum, item) => sum + item.producto.precio * item.cantidad,
      0
    );
  }, [pedido]);

  const cantidadTotal = useMemo(() => {
    return Array.from(pedido.values()).reduce((sum, item) => sum + item.cantidad, 0);
  }, [pedido]);

  const handleAgregar = (producto: Producto) => {
    setPedido((prev) => {
      const nuevo = new Map(prev);
      const existente = nuevo.get(producto.id);
      if (existente) {
        nuevo.set(producto.id, { ...existente, cantidad: existente.cantidad + 1 });
      } else {
        nuevo.set(producto.id, { producto, cantidad: 1, notas: "" });
      }
      return nuevo;
    });
  };

  const handleQuitar = (productoId: string) => {
    setPedido((prev) => {
      const nuevo = new Map(prev);
      const existente = nuevo.get(productoId);
      if (existente && existente.cantidad > 1) {
        nuevo.set(productoId, { ...existente, cantidad: existente.cantidad - 1 });
      } else {
        nuevo.delete(productoId);
      }
      return nuevo;
    });
  };

  const handleNotas = (productoId: string) => {
    setProductoNotasId(productoId);
    const item = pedido.get(productoId);
    setProductoNotas(item?.notas || "");
  };

  const handleGuardarNotas = () => {
    if (productoNotasId) {
      setPedido((prev) => {
        const nuevo = new Map(prev);
        const item = nuevo.get(productoNotasId);
        if (item) {
          nuevo.set(productoNotasId, { ...item, notas: productoNotas });
        }
        return nuevo;
      });
      setProductoNotasId(null);
      setProductoNotas("");
    }
  };

  const handleEnviarPedido = async () => {
    const pedidoArray = Array.from(pedido.values()).map((item) => ({
      productoId: item.producto.id,
      nombre: item.producto.nombre,
      cantidad: item.cantidad,
      precioUnitario: item.producto.precio,
      subtotal: item.producto.precio * item.cantidad,
      notas: item.notas,
    }));

    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesaNumero,
          tipo: "mesa",
          items: pedidoArray,
          total,
          notas: "",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al enviar pedido");
      }

      const pedidoCreado = await res.json();
      console.log("Pedido enviado:", pedidoCreado.id);
      alert("Pedido enviado a cocina! 🍕");
      setPedido(new Map());
      setShowResumen(false);
    } catch (err) {
      console.error("Error enviando pedido:", err);
      alert("Error al enviar el pedido. Intentá de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            <div>
              <h1 className="font-bold text-lg">Pizzería La Nonna</h1>
              {mesaNumero && (
                <p className="text-xs text-gray-500">Mesa {mesaNumero}</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResumen(!showResumen)}
            className="relative"
          >
            🛒 Pedido
            {cantidadTotal > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {cantidadTotal}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      {/* Resumen del pedido */}
      {showResumen && pedido.size > 0 && (
        <div className="bg-red-50 border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h3 className="font-semibold mb-3">Tu pedido</h3>
            <div className="space-y-3">
              {Array.from(pedido.values()).map((item) => (
                <div key={item.producto.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.producto.nombre}</p>
                    {item.notas && (
                      <p className="text-xs text-orange-600">📝 {item.notas}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuitar(item.producto.id)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.cantidad}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAgregar(item.producto)}
                    >
                      +
                    </Button>
                    <span className="w-24 text-right font-medium">
                      {formatCurrency(item.producto.precio * item.cantidad)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleNotas(item.producto.id)}
                    >
                      📝
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 pt-3 border-t text-lg font-bold">
              <span>Total</span>
              <span className="text-red-600">{formatCurrency(total)}</span>
            </div>
            <Button
              className="w-full mt-4 bg-red-600 hover:bg-red-700"
              onClick={handleEnviarPedido}
            >
              Enviar pedido a cocina
            </Button>
          </div>
        </div>
      )}

      {/* Notas popup */}
      {productoNotasId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-3">Notas para el plato</h3>
            <Input
              placeholder="Ej: sin cebolla, sin gluten, poco cocido..."
              value={productoNotas}
              onChange={(e) => setProductoNotas(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setProductoNotasId(null)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleGuardarNotas} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Categorías */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          <Button
            variant={categoriaActiva === null ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoriaActiva(null)}
            className="whitespace-nowrap"
          >
            Todo
          </Button>
          {categorias.map((cat) => (
            <Button
              key={cat.id}
              variant={categoriaActiva === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoriaActiva(cat.id)}
              className="whitespace-nowrap"
            >
              {cat.nombre}
            </Button>
          ))}
        </div>
      </div>

      {/* Productos */}
      <div className="max-w-4xl mx-auto px-4 pb-24 space-y-8">
        {categoriasFiltradas.map((categoria) => (
          <section key={categoria.id}>
            <h2 className="text-xl font-bold mb-4">{categoria.nombre}</h2>
            <div className="space-y-3">
              {categoria.productos
                .filter((p) => p.disponible)
                .map((producto) => {
                  const itemPedido = pedido.get(producto.id);
                  return (
                    <Card key={producto.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Imagen */}
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-3xl">
                            {producto.imagenUrl ? (
                              <img
                                src={producto.imagenUrl}
                                alt={producto.nombre}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              "🍽️"
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">{producto.nombre}</h3>
                                {producto.descripcion && (
                                  <p className="text-sm text-gray-500 line-clamp-1">
                                    {producto.descripcion}
                                  </p>
                                )}
                              </div>
                              <span className="font-bold text-red-600 whitespace-nowrap">
                                {formatCurrency(producto.precio)}
                              </span>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {producto.tiempoPreparacionMin && (
                                <Badge variant="secondary" className="text-xs">
                                  ⏱️ {producto.tiempoPreparacionMin} min
                                </Badge>
                              )}
                              {producto.nivelPicante > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  🌶️ {producto.nivelPicante}
                                </Badge>
                              )}
                              {producto.calorias && (
                                <Badge variant="secondary" className="text-xs">
                                  🔥 {producto.calorias} cal
                                </Badge>
                              )}
                              {producto.alergenos.length > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  ⚠️ {producto.alergenos.join(", ")}
                                </Badge>
                              )}
                              {producto.destacado && (
                                <Badge className="bg-orange-500 text-xs">🔥 Popular</Badge>
                              )}
                            </div>

                            {/* Botón agregar */}
                            <div className="mt-3">
                              {itemPedido ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleQuitar(producto.id)}
                                  >
                                    -
                                  </Button>
                                  <span className="w-8 text-center font-medium">
                                    {itemPedido.cantidad}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAgregar(producto)}
                                  >
                                    +
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleNotas(producto.id)}
                                  >
                                    📝
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleAgregar(producto)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  + Agregar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </section>
        ))}
      </div>

      {/* Botón flotante */}
      {pedido.size > 0 && !showResumen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button
            size="lg"
            onClick={() => setShowResumen(true)}
            className="bg-red-600 hover:bg-red-700 shadow-lg px-6 py-3 rounded-full"
          >
            🛒 Ver pedido ({cantidadTotal}) — {formatCurrency(total)}
          </Button>
        </div>
      )}
    </div>
  );
}
