import { describe, it, expect } from "vitest";

describe("Validation Schemas", () => {
  it("should validate MesaSchema", async () => {
    const { MesaSchema, validateInput } = await import("@/lib/validation");

    const validMesa = {
      numero: "1",
      capacidad: 4,
      sectorId: "550e8400-e29b-41d4-a716-446655440000",
    };

    const result = validateInput(MesaSchema, validMesa);
    expect(result.success).toBe(true);
  });

  it("should reject invalid MesaSchema", async () => {
    const { MesaSchema, validateInput } = await import("@/lib/validation");

    const invalidMesa = {
      numero: "",
      capacidad: -1,
      sectorId: "not-a-uuid",
    };

    const result = validateInput(MesaSchema, invalidMesa);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.startsWith("numero:"))).toBe(true);
    }
  });

  it("should validate ReservaSchema", async () => {
    const { ReservaSchema, validateInput } = await import("@/lib/validation");

    const validReserva = {
      clienteNombre: "Juan Pérez",
      clienteTelefono: "+54 11 1234-5678",
      fecha: "2026-07-15",
      hora: "20:00",
      cantidadPersonas: 4,
    };

    const result = validateInput(ReservaSchema, validReserva);
    expect(result.success).toBe(true);
  });

  it("should validate IngredienteSchema", async () => {
    const { IngredienteSchema, validateInput } = await import("@/lib/validation");

    const validIngrediente = {
      nombre: "Harina",
      unidadMedida: "kg",
      costoUnitario: 100,
      stockMinimo: 10,
      stockMaximo: 100,
    };

    const result = validateInput(IngredienteSchema, validIngrediente);
    expect(result.success).toBe(true);
  });

  it("should validate EmpleadoSchema", async () => {
    const { EmpleadoSchema, validateInput } = await import("@/lib/validation");

    const validEmpleado = {
      usuarioId: "550e8400-e29b-41d4-a716-446655440000",
      sucursalId: "550e8400-e29b-41d4-a716-446655440001",
      cargo: "Mozo",
    };

    const result = validateInput(EmpleadoSchema, validEmpleado);
    expect(result.success).toBe(true);
  });
});

describe("Utils", () => {
  it("should sanitize strings", async () => {
    const { sanitizeString } = await import("@/lib/validation");

    expect(sanitizeString("<script>alert(1)</script>")).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(sanitizeString('"hello"')).toBe("&quot;hello&quot;");
    expect(sanitizeString("  hello  ")).toBe("hello");
  });

  it("should validate UUIDs", async () => {
    const { isValidUUID } = await import("@/lib/validation");

    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isValidUUID("not-a-uuid")).toBe(false);
    expect(isValidUUID("")).toBe(false);
  });

  it("should check rate limits", async () => {
    const { checkRateLimit } = await import("@/lib/validation");

    const key = "test-rate-limit";
    expect(checkRateLimit(key, 5, 60000)).toBe(true);
    expect(checkRateLimit(key, 5, 60000)).toBe(true);
    expect(checkRateLimit(key, 5, 60000)).toBe(true);
    expect(checkRateLimit(key, 5, 60000)).toBe(true);
    expect(checkRateLimit(key, 5, 60000)).toBe(true);
    expect(checkRateLimit(key, 5, 60000)).toBe(false);
  });
});