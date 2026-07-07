"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";

// ============================================
// SERVICIO DE EXPORTACIÓN
// ============================================

export class ExportService {
  static async exportarPDF(data: Record<string, unknown>[], titulo: string): Promise<void> {
    // En producción: usar jsPDF o html2pdf
    const contenido = generarContenidoReporte(data, titulo);
    const blob = new Blob([contenido], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${titulo.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static async exportarExcel(data: Record<string, unknown>[], titulo: string): Promise<void> {
    // En producción: usar xlsx library
    const csv = generarCSV(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${titulo.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static async exportarJSON(data: Record<string, unknown>[], titulo: string): Promise<void> {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${titulo.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

function generarCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      return typeof val === "string" && val.includes(",") ? `"${val}"` : String(val);
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function generarContenidoReporte(data: Record<string, unknown>[], titulo: string): string {
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${titulo}</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        h1 { color: #DC2626; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        .footer { margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>${titulo}</h1>
      <p>Generado: ${new Date().toLocaleString("es-AR")}</p>
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${data.map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
      <div class="footer">RestaurantOS - Reporte generado automáticamente</div>
    </body>
    </html>
  `;
}

// ============================================
// GENERADOR DE REPORTES
// ============================================

export interface ReporteConfig {
  tipo: string;
  titulo: string;
  periodo: string;
  filtros: Record<string, string>;
}

export class ReportesService {
  static async generarReporte(config: ReporteConfig): Promise<Record<string, unknown>[]> {
    // En producción: query a DB con los filtros
    const data: Record<string, unknown>[] = [];

    switch (config.tipo) {
      case "ventas":
        return [
          { fecha: "2026-07-01", ventas: 850000, pedidos: 62, ticket: 13709 },
          { fecha: "2026-07-02", ventas: 920000, pedidos: 68, ticket: 13529 },
          { fecha: "2026-07-03", ventas: 780000, pedidos: 55, ticket: 14181 },
          { fecha: "2026-07-04", ventas: 1100000, pedidos: 78, ticket: 14102 },
          { fecha: "2026-07-05", ventas: 1250000, pedidos: 89, ticket: 14045 },
        ];

      case "productos":
        return [
          { producto: "Pizza Muzzarella", cantidad: 156, total: 780000, margen: 62 },
          { producto: "Fugazzeta Rellena", cantidad: 98, total: 637000, margen: 58 },
          { producto: "Empanadas x12", cantidad: 85, total: 510000, margen: 55 },
          { producto: "Ñoquis Caseros", cantidad: 72, total: 432000, margen: 65 },
          { producto: "Helado Artesanal", cantidad: 64, total: 256000, margen: 70 },
        ];

      case "empleados":
        return [
          { empleado: "Carlos García", rol: "Mozo", horas: 160, ventas: 2500000, propinas: 180000 },
          { empleado: "Ana López", rol: "Cocinero", horas: 160, pedidos: 450, eficiencia: 94 },
          { empleado: "Pedro Martínez", rol: "Barman", horas: 140, bebidas: 320, satisfaccion: 4.8 },
        ];

      case "clientes":
        return [
          { cliente: "Juan Pérez", visitas: 24, totalGastado: 320000, puntos: 1200, nivel: "Oro" },
          { cliente: "María García", visitas: 18, totalGastado: 240000, puntos: 800, nivel: "Plata" },
          { cliente: "Carlos López", visitas: 32, totalGastado: 480000, puntos: 2500, nivel: "Platino" },
        ];

      default:
        return data;
    }
  }
}

// ============================================
// COMPONENTE: Panel de Reportes
// ============================================

export function PanelReportes() {
  const [reporteActivo, setReporteActivo] = useState("ventas");
  const [periodo, setPeriodo] = useState("semana");
  const [datos, setDatos] = useState<Record<string, unknown>[]>([]);
  const [cargando, setCargando] = useState(false);

  const generarReporte = async () => {
    setCargando(true);
    try {
      const data = await ReportesService.generarReporte({
        tipo: reporteActivo,
        titulo: `Reporte de ${reporteActivo}`,
        periodo,
        filtros: {},
      });
      setDatos(data);
    } finally {
      setCargando(false);
    }
  };

  const exportar = async (formato: "pdf" | "excel" | "json") => {
    if (datos.length === 0) return;

    const titulo = `Reporte ${reporteActivo} - ${periodo}`;

    switch (formato) {
      case "pdf":
        await ExportService.exportarPDF(datos, titulo);
        break;
      case "excel":
        await ExportService.exportarExcel(datos, titulo);
        break;
      case "json":
        await ExportService.exportarJSON(datos, titulo);
        break;
    }
  };

  const reportes = [
    { id: "ventas", nombre: "💰 Ventas", desc: "Resumen de ventas por período" },
    { id: "productos", nombre: "🍕 Productos", desc: "Top productos más vendidos" },
    { id: "empleados", nombre: "👥 Empleados", desc: "Performance del equipo" },
    { id: "clientes", nombre: "🎯 Clientes", desc: "CRM y fidelización" },
  ];

  const headers = datos.length > 0 ? Object.keys(datos[0]) : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-gray-500">Generá y exportá reportes detallados</p>
        </div>
      </div>

      {/* Selector de reporte */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportes.map((rep) => (
          <Card
            key={rep.id}
            className={cn(
              "cursor-pointer hover:shadow-md transition-shadow",
              reporteActivo === rep.id && "border-2 border-red-500"
            )}
            onClick={() => setReporteActivo(rep.id)}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl">{rep.nombre.split(" ")[0]}</p>
              <p className="font-medium mt-2">{rep.nombre.split(" ").slice(1).join(" ")}</p>
              <p className="text-xs text-gray-500 mt-1">{rep.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controles */}
      <div className="flex gap-4 items-end">
        <div>
          <label className="text-sm font-medium">Período</label>
          <Select value={periodo} onValueChange={(v) => { if (v) setPeriodo(v) }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mes</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="anio">Este año</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={generarReporte} disabled={cargando}>
          {cargando ? "Generando..." : "📊 Generar reporte"}
        </Button>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={() => exportar("pdf")} disabled={datos.length === 0}>
            📄 PDF
          </Button>
          <Button variant="outline" onClick={() => exportar("excel")} disabled={datos.length === 0}>
            📊 Excel
          </Button>
          <Button variant="outline" onClick={() => exportar("json")} disabled={datos.length === 0}>
            { }
            JSON
          </Button>
        </div>
      </div>

      {/* Tabla de resultados */}
      {datos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados ({datos.length} registros)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {headers.map((h) => (
                      <th key={h} className="text-left p-2 font-medium text-gray-600 capitalize">
                        {h.replace(/([A-Z])/g, " $1").trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datos.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      {headers.map((h) => (
                        <td key={h} className="p-2">
                          {typeof row[h] === "number"
                            ? row[h] > 1000
                              ? formatCurrency(row[h] as number)
                              : row[h]
                            : String(row[h] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
