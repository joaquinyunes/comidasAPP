import { beforeAll, afterAll, vi } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
  // Configurar variables de entorno para tests
  process.env.JWT_SECRET = "test-secret-key-for-testing";
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Mock de NextRequest para tests
global.NextRequest = class NextRequest {
  constructor(
    public url: string,
    public init: RequestInit = {}
  ) {}

  get method() {
    return this.init.method || "GET";
  }

  get headers() {
    return new Headers(this.init.headers as HeadersInit);
  }

  get body() {
    return this.init.body as ReadableStream | null;
  }

  async json() {
    if (typeof this.init.body === "string") {
      return JSON.parse(this.init.body);
    }
    return this.init.body;
  }

  get cookies() {
    const cookieHeader = this.headers.get("cookie") || "";
    const cookies = new Map();
    cookieHeader.split(";").forEach((cookie) => {
      const [name, ...rest] = cookie.trim().split("=");
      if (name) cookies.set(name, rest.join("="));
    });
    return {
      get: (name: string) => ({ value: cookies.get(name) }),
      set: vi.fn(),
      delete: vi.fn(),
    };
  }

  get nextUrl() {
    return new URL(this.url);
  }
} as any;

// Mock de NextResponse
global.NextResponse = class NextResponse {
  static json(data: any, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  }
} as any;