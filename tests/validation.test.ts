import { describe, it, expect } from "vitest";
import {
  TenantSchema,
  ProductoSchema,
  PedidoSchema,
  CajaSchema,
  MesaSchema,
  SectorSchema,
  ReservaSchema,
  IngredienteSchema,
  StockPorSucursalSchema,
  ProveedorSchema,
  OrdenCompraSchema,
  EmpleadoSchema,
  TurnoSchema,
  AsistenciaSchema,
  CampanaSchema,
  CuponSchema,
  AuditLogSchema,
  PrediccionSchema,
  ConfigTenantSchema,
  ChecklistPlantillaSchema,
  ChecklistEjecucionSchema,
  FichajeSchema,
  AnulacionSchema,
  OfflineSyncSchema,
  RecetaCentralizadaSchema,
  SucursalConfigSchema,
  VisitaMesaSchema,
  ReconocimientoSchema,
  ClientePedidoSchema,
  validateInput,
  sanitizeString,
  isValidUUID,
  checkRateLimit,
} from "@/lib/validation";

const UUID = "550e8400-e29b-41d4-a716-446655440000";
const UUID2 = "550e8400-e29b-41d4-a716-446655440001";

describe("Validation: schemas core", () => {
  it("TenantSchema valido", () => {
    const r = TenantSchema.safeParse({
      nombre: "Local",
      subdominio: "local-1",
      email: "a@b.com",
    });
    expect(r.success).toBe(true);
  });
  it("TenantSchema rechaza subdominio con mayusculas", () => {
    expect(
      TenantSchema.safeParse({ nombre: "L", subdominio: "Local", email: "a@b.com" }).success
    ).toBe(false);
  });

  it("ProductoSchema valido", () => {
    expect(
      ProductoSchema.safeParse({ nombre: "Pizza", precioBase: 1000, categoriaId: UUID }).success
    ).toBe(true);
  });
  it("ProductoSchema rechaza precio <= 0", () => {
    expect(
      ProductoSchema.safeParse({ nombre: "Pizza", precioBase: -1, categoriaId: UUID }).success
    ).toBe(false);
  });

  it("PedidoSchema valido", () => {
    const r = PedidoSchema.safeParse({
      mesaId: UUID,
      mozoId: UUID,
      tipo: "mesa",
      items: [{ productoId: UUID, cantidad: 2 }],
    });
    expect(r.success).toBe(true);
  });
  it("PedidoSchema rechaza sin items", () => {
    expect(
      PedidoSchema.safeParse({ mesaId: UUID, mozoId: UUID, tipo: "mesa", items: [] }).success
    ).toBe(false);
  });

  it("CajaSchema valido", () => {
    expect(CajaSchema.safeParse({ tipo: "apertura", monto: 100, descripcion: "x" }).success).toBe(true);
  });
  it("CajaSchema rechaza tipo invalido", () => {
    expect(CajaSchema.safeParse({ tipo: "otro", monto: 100, descripcion: "x" }).success).toBe(false);
  });
});

describe("Validation: schemas modulo (mesa/reserva/inventario/compras/rrhh/marketing)", () => {
  it("MesaSchema valido", () => {
    expect(MesaSchema.safeParse({ numero: "1", capacidad: 4, sectorId: UUID }).success).toBe(true);
  });
  it("MesaSchema rechaza capacidad <= 0", () => {
    expect(MesaSchema.safeParse({ numero: "1", capacidad: 0, sectorId: UUID }).success).toBe(false);
  });

  it("SectorSchema valido", () => {
    expect(SectorSchema.safeParse({ nombre: "Salon", tipo: "interior" }).success).toBe(true);
  });

  it("ReservaSchema valido", () => {
    const r = ReservaSchema.safeParse({
      clienteNombre: "Juan",
      clienteTelefono: "+54 11 1234-5678",
      fecha: "2026-07-15",
      hora: "20:00",
      cantidadPersonas: 4,
    });
    expect(r.success).toBe(true);
  });
  it("ReservaSchema rechaza fecha mal formada", () => {
    expect(
      ReservaSchema.safeParse({
        clienteNombre: "Juan",
        clienteTelefono: "+54 11 1234-5678",
        fecha: "15/07/2026",
        hora: "20:00",
        cantidadPersonas: 4,
      }).success
    ).toBe(false);
  });

  it("IngredienteSchema valido", () => {
    expect(IngredienteSchema.safeParse({ nombre: "Harina", unidadMedida: "kg" }).success).toBe(true);
  });

  it("StockPorSucursalSchema valido", () => {
    expect(
      StockPorSucursalSchema.safeParse({
        sucursalId: UUID,
        ingredienteId: UUID,
        cantidadActual: 10,
      }).success
    ).toBe(true);
  });

  it("ProveedorSchema (compras) valido", () => {
    expect(
      ProveedorSchema.safeParse({ nombre: "Distribuidora", tiempoEntregaDias: 3 }).success
    ).toBe(true);
  });

  it("OrdenCompraSchema valido", () => {
    const r = OrdenCompraSchema.safeParse({
      proveedorId: UUID,
      sucursalId: UUID,
      items: [{ ingredienteId: UUID, cantidad: 5, precioUnitario: 100 }],
    });
    expect(r.success).toBe(true);
  });
  it("OrdenCompraSchema rechaza items vacios", () => {
    expect(
      OrdenCompraSchema.safeParse({ proveedorId: UUID, sucursalId: UUID, items: [] }).success
    ).toBe(false);
  });

  it("EmpleadoSchema valido", () => {
    expect(
      EmpleadoSchema.safeParse({ usuarioId: UUID, sucursalId: UUID, cargo: "Mozo" }).success
    ).toBe(true);
  });

  it("TurnoSchema valido", () => {
    expect(
      TurnoSchema.safeParse({
        empleadoId: UUID,
        sucursalId: UUID,
        fecha: "2026-07-15",
        horaInicio: "09:00",
        horaFin: "17:00",
      }).success
    ).toBe(true);
  });

  it("AsistenciaSchema valido sin campos", () => {
    expect(AsistenciaSchema.safeParse({ empleadoId: UUID }).success).toBe(true);
  });

  it("CampanaSchema valido", () => {
    expect(
      CampanaSchema.safeParse({ nombre: "Promo", tipo: "email", fechaInicio: "2026-07-15" }).success
    ).toBe(true);
  });
  it("CuponSchema valido", () => {
    expect(
      CuponSchema.safeParse({
        codigo: "VERANO10",
        descripcion: "10% off",
        tipo: "porcentaje",
        valor: 10,
        fechaInicio: "2026-07-15",
        fechaFin: "2026-08-15",
        usosMaximos: 100,
      }).success
    ).toBe(true);
  });
  it("CuponSchema rechaza codigo lowercase", () => {
    expect(
      CuponSchema.safeParse({
        codigo: "verano10",
        descripcion: "x",
        tipo: "porcentaje",
        valor: 10,
        fechaInicio: "2026-07-15",
        fechaFin: "2026-08-15",
        usosMaximos: 100,
      }).success
    ).toBe(false);
  });

  it("AuditLogSchema valido", () => {
    expect(AuditLogSchema.safeParse({ accion: "UPDATE", entidad: "Mesa" }).success).toBe(true);
  });

  it("PrediccionSchema valido", () => {
    expect(
      PrediccionSchema.safeParse({
        tipo: "ventas",
        modelo: "arima",
        parametros: { p: 1 },
        horizonteDias: 30,
      }).success
    ).toBe(true);
  });
  it("PrediccionSchema rechaza horizonte > 90", () => {
    expect(
      PrediccionSchema.safeParse({
        tipo: "ventas",
        modelo: "arima",
        parametros: {},
        horizonteDias: 120,
      }).success
    ).toBe(false);
  });

  it("ConfigTenantSchema valido con defaults", () => {
    expect(ConfigTenantSchema.safeParse({ nombre: "Local" }).success).toBe(true);
  });
});

describe("Validation: Bloque 2 - micro-fases 2.1 / 2.2 / 2.3", () => {
  it("ChecklistPlantillaSchema valido", () => {
    const r = ChecklistPlantillaSchema.safeParse({
      tipo: "APERTURA",
      nombre: "Apertura",
      items: [{ descripcion: "Limpiar" }],
    });
    expect(r.success).toBe(true);
  });
  it("ChecklistPlantillaSchema rechaza sin items", () => {
    expect(
      ChecklistPlantillaSchema.safeParse({ tipo: "APERTURA", nombre: "Apertura", items: [] }).success
    ).toBe(false);
  });

  it("ChecklistEjecucionSchema valido", () => {
    expect(
      ChecklistEjecucionSchema.safeParse({
        plantillaId: UUID,
        sucursalId: UUID,
        items: [{ itemId: UUID, marcado: true }],
      }).success
    ).toBe(true);
  });

  it("FichajeSchema valido", () => {
    expect(FichajeSchema.safeParse({ empleadoId: UUID, tipo: "ENTRADA" }).success).toBe(true);
  });
  it("FichajeSchema rechaza tipo invalido", () => {
    expect(FichajeSchema.safeParse({ empleadoId: UUID, tipo: "X" }).success).toBe(false);
  });

  it("AnulacionSchema valido", () => {
    expect(AnulacionSchema.safeParse({ pedidoItemId: UUID, motivo: "Error" }).success).toBe(true);
  });
  it("AnulacionSchema rechaza motivo vacio", () => {
    expect(AnulacionSchema.safeParse({ pedidoItemId: UUID, motivo: "" }).success).toBe(false);
  });

  it("OfflineSyncSchema valido", () => {
    expect(
      OfflineSyncSchema.safeParse({
        items: [{ ruta: "/api/x", metodo: "POST", payload: { a: 1 }, clientId: "c1" }],
      }).success
    ).toBe(true);
  });
  it("OfflineSyncSchema rechaza mas de 100 items", () => {
    const items = Array.from({ length: 101 }, (_, i) => ({
      ruta: "/api/x",
      metodo: "POST",
      payload: {},
      clientId: "c" + i,
    }));
    expect(OfflineSyncSchema.safeParse({ items }).success).toBe(false);
  });

  it("RecetaCentralizadaSchema valido", () => {
    const r = RecetaCentralizadaSchema.safeParse({
      productoId: UUID,
      ingredientes: [{ ingredienteId: UUID, cantidad: 2, unidad: "kg" }],
    });
    expect(r.success).toBe(true);
  });
  it("RecetaCentralizadaSchema rechaza sin ingredientes", () => {
    expect(RecetaCentralizadaSchema.safeParse({ productoId: UUID, ingredientes: [] }).success).toBe(
      false
    );
  });

  it("SucursalConfigSchema valido (todo opcional)", () => {
    expect(SucursalConfigSchema.safeParse({}).success).toBe(true);
    expect(SucursalConfigSchema.safeParse({ nombre: "Suc 2", activa: true }).success).toBe(true);
  });
});

describe("Validation: Bloque 2 - 2.4 y Cliente (autogestion)", () => {
  it("VisitaMesaSchema valido con cliente", () => {
    expect(VisitaMesaSchema.safeParse({ clienteId: UUID, mesaId: UUID, personas: 2 }).success).toBe(
      true
    );
  });
  it("VisitaMesaSchema valido sin cliente", () => {
    expect(VisitaMesaSchema.safeParse({ mesaId: UUID }).success).toBe(true);
  });
  it("VisitaMesaSchema rechaza mesaId invalido", () => {
    expect(VisitaMesaSchema.safeParse({ mesaId: "no-uuid" }).success).toBe(false);
  });

  it("ReconocimientoSchema valido", () => {
    expect(ReconocimientoSchema.safeParse({ mesaId: UUID, clienteId: UUID }).success).toBe(true);
  });
  it("ReconocimientoSchema requiere ambos ids", () => {
    expect(ReconocimientoSchema.safeParse({ mesaId: UUID }).success).toBe(false);
  });

  it("ClientePedidoSchema valido", () => {
    const r = ClientePedidoSchema.safeParse({
      mesaId: UUID,
      items: [{ productoId: UUID, cantidad: 1 }],
    });
    expect(r.success).toBe(true);
  });
  it("ClientePedidoSchema rechaza mas de 30 items", () => {
    const items = Array.from({ length: 31 }, () => ({ productoId: UUID, cantidad: 1 }));
    expect(ClientePedidoSchema.safeParse({ mesaId: UUID, items }).success).toBe(false);
  });
  it("ClientePedidoSchema rechaza cantidad 0", () => {
    expect(
      ClientePedidoSchema.safeParse({
        mesaId: UUID,
        items: [{ productoId: UUID, cantidad: 0 }],
      }).success
    ).toBe(false);
  });
});

describe("Validation: utilidades", () => {
  it("validateInput devuelve success con data", () => {
    const r = validateInput(MesaSchema, { numero: "1", capacidad: 4, sectorId: UUID });
    expect(r.success).toBe(true);
  });
  it("validateInput devuelve errors en fallo", () => {
    const r = validateInput(MesaSchema, { numero: "", capacidad: -1, sectorId: "x" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(Array.isArray(r.errors)).toBe(true);
      expect(r.errors.length).toBeGreaterThan(0);
    }
  });

  it("sanitizeString escapa HTML y trimea", () => {
    expect(sanitizeString("<script>")).toBe("&lt;script&gt;");
    expect(sanitizeString("  hola  ")).toBe("hola");
  });

  it("isValidUUID valida correctamente", () => {
    expect(isValidUUID(UUID)).toBe(true);
    expect(isValidUUID("no-uuid")).toBe(false);
    expect(isValidUUID("")).toBe(false);
  });

  it("checkRateLimit permite y luego bloquea", () => {
    const key = "rl-" + Date.now();
    expect(checkRateLimit(key, 3, 60000)).toBe(true);
    expect(checkRateLimit(key, 3, 60000)).toBe(true);
    expect(checkRateLimit(key, 3, 60000)).toBe(true);
    expect(checkRateLimit(key, 3, 60000)).toBe(false);
  });
});
