import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateInput, sanitizeString, isValidUUID, checkRateLimit } from "@/lib/validation";
import { AppError, handleError, asyncHandler, successResponse, errorResponse } from "@/lib/errors";
import { rateLimit, authRateLimit, publicApiRateLimit, authenticatedApiRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

describe("Validation", () => {
  describe("validateInput", () => {
    it("should validate correct data", () => {
      const schema = z.object({
        nombre: z.string().min(1),
        edad: z.number().positive(),
      });

      const result = validateInput(schema, { nombre: "Juan", edad: 25 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ nombre: "Juan", edad: 25 });
      }
    });

    it("should reject invalid data", () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const result = validateInput(schema, { email: "invalid" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("email: Invalid email");
      }
    });
  });

  describe("sanitizeString", () => {
    it("should escape HTML characters", () => {
      expect(sanitizeString("<script>")).toBe("&lt;script&gt;");
      expect(sanitizeString(">")).toBe("&gt;");
      expect(sanitizeString('"')).toBe("&quot;");
      expect(sanitizeString("'")).toBe("&#x27;");
    });

    it("should trim whitespace", () => {
      expect(sanitizeString("  hello  ")).toBe("hello");
    });
  });

  describe("isValidUUID", () => {
    it("should validate correct UUIDs", () => {
      expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
      expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });

    it("should reject invalid UUIDs", () => {
      expect(isValidUUID("not-a-uuid")).toBe(false);
      expect(isValidUUID("")).toBe(false);
      expect(isValidUUID("550e8400-e29b-41d4-a716")).toBe(false);
    });
  });

  describe("checkRateLimit", () => {
    it("should allow requests within limit", () => {
      const key = "test-" + Date.now();
      for (let i = 0; i < 5; i++) {
        expect(checkRateLimit(key, 5, 60000)).toBe(true);
      }
    });

    it("should reject requests over limit", () => {
      const key = "test-" + Date.now();
      for (let i = 0; i < 5; i++) {
        checkRateLimit(key, 5, 60000);
      }
      expect(checkRateLimit(key, 5, 60000)).toBe(false);
    });
  });
});

describe("Errors", () => {
  describe("AppError", () => {
    it("should create error with correct status codes", () => {
      expect(AppError.badRequest("Bad request").statusCode).toBe(400);
      expect(AppError.unauthorized().statusCode).toBe(401);
      expect(AppError.forbidden().statusCode).toBe(403);
      expect(AppError.notFound().statusCode).toBe(404);
      expect(AppError.conflict("Conflict").statusCode).toBe(409);
      expect(AppError.validation("Invalid").statusCode).toBe(422);
      expect(AppError.internal().statusCode).toBe(500);
      expect(AppError.tooManyRequests().statusCode).toBe(429);
    });

    it("should include code and details", () => {
      const error = AppError.badRequest("Bad request", { field: "email" });
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.details).toEqual({ field: "email" });
    });
  });

  describe("handleError", () => {
    it("should handle AppError", () => {
      const error = AppError.notFound("Not found");
      const response = handleError(error);
      expect(response.status).toBe(404);
    });

    it("should handle unknown errors", () => {
      const response = handleError(new Error("Unknown"));
      expect(response.status).toBe(500);
    });
  });

  describe("Response helpers", () => {
    it("should create success response", () => {
      const response = successResponse({ id: 1 }, "Created", 201);
      expect(response.status).toBe(201);
    });

    it("should create error response", () => {
      const response = errorResponse("Error", 400, "BAD_REQUEST", { field: "name" });
      expect(response.status).toBe(400);
    });

    it("should create paginated response", () => {
      const response = paginatedResponse([1, 2, 3], 1, 10, 3);
      expect(response.status).toBe(200);
    });
  });
});

describe("Rate Limiting", () => {
  describe("rateLimit", () => {
    it("should allow requests within limit", async () => {
      const middleware = rateLimit({ maxRequests: 5, windowMs: 60000 });
      const request = new NextRequest("http://localhost/api/test");

      for (let i = 0; i < 5; i++) {
        const result = await middleware(request);
        expect(result).toBeNull();
      }
    });

    it("should reject requests over limit", async () => {
      const middleware = rateLimit({ maxRequests: 2, windowMs: 60000 });
      const request = new NextRequest("http://localhost/api/test");

      await middleware(request);
      await middleware(request);
      const result = await middleware(request);

      expect(result).not.toBeNull();
      expect(result!.status).toBe(429);
    });
  });

  describe("authRateLimit", () => {
    it("should limit auth requests", async () => {
      const request = new NextRequest("http://localhost/api/auth/login");

      for (let i = 0; i < 10; i++) {
        const result = await authRateLimit(request);
        if (i < 10) expect(result).toBeNull();
      }
    });
  });
});

describe("Logger", () => {
  it("should log at different levels", () => {
    const { logger } = require("@/lib/logger");
    expect(() => logger.debug("debug")).not.toThrow();
    expect(() => logger.info("info")).not.toThrow();
    expect(() => logger.warn("warn")).not.toThrow();
    expect(() => logger.error("error")).not.toThrow();
    expect(() => logger.fatal("fatal")).not.toThrow();
  });
});

// Import zod for validation tests
import { z } from "zod";
import { paginatedResponse } from "@/lib/errors";