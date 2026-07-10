import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/auth/login/route";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "test-secret";

describe("Auth API", () => {
  const testTenantId = "test-tenant-" + Date.now();
  const testUserId = "test-user-" + Date.now();
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "password123";

  beforeAll(async () => {
    await prisma.tenant.create({
      data: {
        id: testTenantId,
        nombre: "Test Tenant",
        slug: "test-tenant",
        plan: "basico",
        activo: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.tenant.delete({ where: { id: testTenantId } });
  });

  describe("POST /api/auth/login - Register", () => {
    it("should register a new user", async () => {
      const request = new NextRequest("http://localhost/api/auth/login/register", {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          nombre: "Test User",
          tenantId: testTenantId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
      expect(data.user.nombre).toBe("Test User");
    });

    it("should reject duplicate email", async () => {
      const request = new NextRequest("http://localhost/api/auth/login/register", {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          nombre: "Test User 2",
          tenantId: testTenantId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toContain("ya está registrado");
    });

    it("should reject invalid email", async () => {
      const request = new NextRequest("http://localhost/api/auth/login/register", {
        method: "POST",
        body: JSON.stringify({
          email: "invalid-email",
          password: testPassword,
          nombre: "Test User",
          tenantId: testTenantId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Datos inválidos");
    });

    it("should reject short password", async () => {
      const request = new NextRequest("http://localhost/api/auth/login/register", {
        method: "POST",
        body: JSON.stringify({
          email: "new@example.com",
          password: "123",
          nombre: "Test User",
          tenantId: testTenantId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Datos inválidos");
    });
  });

  describe("POST /api/auth/login - Login", () => {
    it("should login with valid credentials", async () => {
      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
    });

    it("should reject invalid password", async () => {
      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
          password: "wrongpassword",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Credenciales inválidas");
    });

    it("should reject non-existent user", async () => {
      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: testPassword,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Credenciales inválidas");
    });
  });

  describe("DELETE /api/auth/login - Logout", () => {
    it("should clear token cookie", async () => {
      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "DELETE",
      });

      // Need to import DELETE from the route
      const { DELETE } = await import("@/app/api/auth/login/route");
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});

describe("Validation Schemas", () => {
  // Tests for validation schemas
  it("should validate Mesa schema", () => {
    const { MesaSchema } = await import("@/lib/validation");
    const result = MesaSchema.safeParse({
      numero: "1",
      capacidad: 4,
      sectorId: "sector-1",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid Mesa schema", () => {
    const { MesaSchema } = await import("@/lib/validation");
    const result = MesaSchema.safeParse({
      numero: "",
      capacidad: -1,
    });
    expect(result.success).toBe(false);
  });

  it("should validate Producto schema", () => {
    const { ProductoSchema } = await import("@/lib/validation");
    const result = ProductoSchema.safeParse({
      nombre: "Pizza Test",
      precioBase: 1000,
      categoriaId: "cat-1",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid Producto schema", () => {
    const { ProductoSchema } = await import("@/lib/validation");
    const result = ProductoSchema.safeParse({
      nombre: "",
      precioBase: -100,
    });
    expect(result.success).toBe(false);
  });
});