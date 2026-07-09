import { prisma } from "./prisma";

// ============================================
// SERVICIO DE IA PREDICTIVA
// ============================================

export interface PrediccionVenta {
  fecha: string;
  ventasEstimadas: number;
  confianza: number;
  tendencia: "subida" | "bajada" | "estable";
}

export interface PrediccionStock {
  ingredienteId: string;
  ingredienteNombre: string;
  stockActual: number;
  consumoDiarioPromedio: number;
  diasRestantes: number;
  fechaAgotamiento: Date | null;
  recomendacion: string;
  urgencia: "baja" | "media" | "alta" | "critica";
}

export interface RecomendacionProducto {
  productoId: string;
  nombre: string;
  razon: string;
  scoreRelevancia: number;
}

export interface AlertaIA {
  id: string;
  tipo: "stock" | "venta" | "cliente" | "operacion";
  titulo: string;
  descripcion: string;
  urgencia: "baja" | "media" | "alta";
  accionSugerida: string;
  createdAt: Date;
}

// ============================================
// CLASE PRINCIPAL DE IA
// ============================================

export class IAPredictivaService {
  // ============================================
  // PREDICCIÓN DE VENTAS
  // ============================================

  static async predecirVentas(tenantId: string, dias: number = 7): Promise<PrediccionVenta[]> {
    // En producción: usar modelos de ML (TensorFlow.js, o API externa)
    // Por ahora: algoritmo simple de promedio móvil

    const historial = await prisma.pedido.findMany({
      where: {
        tenantId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        estado: "cerrado",
      },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Agrupar por día
    const ventasPorDia: Record<string, number> = {};
    for (const pedido of historial) {
      const fecha = pedido.createdAt.toISOString().split("T")[0];
      ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + Number(pedido.total);
    }

    const valores = Object.values(ventasPorDia);
    const promedio = valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
    const ultimaSemana = valores.slice(-7);
    const promedioUltimaSemana = ultimaSemana.length > 0
      ? ultimaSemana.reduce((a, b) => a + b, 0) / ultimaSemana.length
      : promedio;

    // Tendencia
    const tendencia = promedioUltimaSemana > promedio * 1.1
      ? "subida"
      : promedioUltimaSemana < promedio * 0.9
      ? "bajada"
      : "estable";

    const predicciones: PrediccionVenta[] = [];
    const hoy = new Date();

    for (let i = 1; i <= dias; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + i);

      // Factor día de la semana
      const diaSemana = fecha.getDay();
      const factorDia = [1.2, 1.0, 0.9, 1.0, 1.3, 1.5, 1.4][diaSemana]; // Dom es 1.2, Sáb 1.5

      const estimado = promedioUltimaSemana * factorDia * (tendencia === "subida" ? 1.05 : tendencia === "bajada" ? 0.95 : 1);

      predicciones.push({
        fecha: fecha.toISOString().split("T")[0],
        ventasEstimadas: Math.round(estimado),
        confianza: Math.min(0.9, 0.5 + (dias - i) * 0.05),
        tendencia,
      });
    }

    return predicciones;
  }

  // ============================================
  // PREDICCIÓN DE STOCK
  // ============================================

  static async predecirStock(tenantId: string): Promise<PrediccionStock[]> {
    const ingredientes = await prisma.ingrediente.findMany({
      where: { tenantId, activo: true },
      include: {
        stockPorSucursal: true,
        recetaIngredientes: {
          include: { receta: { include: { producto: true } } },
        },
      },
    });

    const predicciones: PrediccionStock[] = [];

    for (const ingrediente of ingredientes) {
      const stockTotal = ingrediente.stockPorSucursal.reduce(
        (sum, s) => sum + Number(s.cantidadActual), 0
      );

      // Calcular consumo diario promedio (simplificado)
      const consumoDiario = ingrediente.recetaIngredientes.length * 50; // Mock

      const diasRestantes = consumoDiario > 0 ? Math.floor(stockTotal / consumoDiario) : 999;

      const fechaAgotamiento = new Date();
      fechaAgotamiento.setDate(fechaAgotamiento.getDate() + diasRestantes);

      let urgencia: PrediccionStock["urgencia"] = "baja";
      let recomendacion = "Stock suficiente";

      if (diasRestantes <= 2) {
        urgencia = "critica";
        recomendacion = "⚡ Pedido urgente necesario";
      } else if (diasRestantes <= 5) {
        urgencia = "alta";
        recomendacion = "📦 Realizar pedido pronto";
      } else if (diasRestantes <= 10) {
        urgencia = "media";
        recomendacion = "📋 Considerar reposición";
      }

      predicciones.push({
        ingredienteId: ingrediente.id,
        ingredienteNombre: ingrediente.nombre,
        stockActual: stockTotal,
        consumoDiarioPromedio: consumoDiario,
        diasRestantes,
        fechaAgotamiento: diasRestantes < 30 ? fechaAgotamiento : null,
        recomendacion,
        urgencia,
      });
    }

    return predicciones.sort((a, b) => a.diasRestantes - b.diasRestantes);
  }

  // ============================================
  // RECOMENDACIONES PERSONALIZADAS
  // ============================================

  static async recomendarProductos(clienteId: string): Promise<RecomendacionProducto[]> {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        favoritos: { include: { producto: true } },
        pedidos: {
          include: {
            items: { include: { producto: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!cliente) return [];

    // Productos más pedidos por el cliente
    const productosFrecuentes: Record<string, number> = {};
    for (const pedido of cliente.pedidos) {
      for (const item of pedido.items) {
        productosFrecuentes[item.productoId] = (productosFrecuentes[item.productoId] || 0) + item.cantidad;
      }
    }

    // Obtener todos los productos
    const todosLosProductos = await prisma.producto.findMany({
      where: { tenantId: cliente.tenantId, disponible: true },
    });

    const recomendaciones: RecomendacionProducto[] = [];

    for (const producto of todosLosProductos) {
      // No recomendar lo que ya pidió mucho
      if ((productosFrecuentes[producto.id] || 0) > 5) continue;

      let score = 0;
      let razon = "";

      // Si es favorito
      if (cliente.favoritos.some((f) => f.productoId === producto.id)) {
        score += 50;
        razon = "Es uno de tus favoritos";
      }

      // Si es similar a lo que pide
      if (productosFrecuentes[producto.id]) {
        score += 30;
        razon = razon || "Similar a lo que solés pedir";
      }

      // Si es destacado
      if (producto.destacado) {
        score += 10;
        razon = razon || "Producto destacado";
      }

      if (score > 0) {
        recomendaciones.push({
          productoId: producto.id,
          nombre: producto.nombre,
          razon,
          scoreRelevancia: score,
        });
      }
    }

    return recomendaciones
      .sort((a, b) => b.scoreRelevancia - a.scoreRelevancia)
      .slice(0, 5);
  }

  // ============================================
  // ALERTAS INTELIGENTES
  // ============================================

  static async generarAlertas(tenantId: string): Promise<AlertaIA[]> {
    const alertas: AlertaIA[] = [];

    // Alerta de stock bajo
    const stockPredicciones = await this.predecirStock(tenantId);
    for (const stock of stockPredicciones.filter((s) => s.urgencia === "critica" || s.urgencia === "alta")) {
      alertas.push({
        id: `stock-${stock.ingredienteId}`,
        tipo: "stock",
        titulo: `Stock ${stock.urgencia}: ${stock.ingredienteNombre}`,
        descripcion: `Quedan ${stock.diasRestantes} días de stock. ${stock.recomendacion}`,
        urgencia: stock.urgencia === "critica" ? "alta" : "media",
        accionSugerida: "Crear orden de compra",
        createdAt: new Date(),
      });
    }

    // Alerta de venta inusual
    const prediccionVentas = await this.predecirVentas(tenantId, 1);
    if (prediccionVentas.length > 0 && prediccionVentas[0].confianza > 0.7) {
      if (prediccionVentas[0].tendencia === "bajada") {
        alertas.push({
          id: "venta-bajada",
          tipo: "venta",
          titulo: "Tendencia de ventas a la baja",
          descripcion: "Se detectó una disminución en las ventas. Considerar promociones.",
          urgencia: "media",
          accionSugerida: "Revisar marketing y promociones",
          createdAt: new Date(),
        });
      }
    }

    return alertas;
  }
}
