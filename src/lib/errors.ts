import { NextResponse } from "next/server";
import { z } from "zod";

export interface AppErrorOptions {
  code?: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = options.statusCode || 500;
    this.code = options.code || "INTERNAL_ERROR";
    this.details = options.details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: Record<string, unknown>) {
    return new AppError(message, { code: "BAD_REQUEST", details, statusCode: 400 });
  }

  static unauthorized(message = "No autorizado", details?: Record<string, unknown>) {
    return new AppError(message, { code: "UNAUTHORIZED", details, statusCode: 401 });
  }

  static forbidden(message = "Acceso denegado", details?: Record<string, unknown>) {
    return new AppError(message, { code: "FORBIDDEN", details, statusCode: 403 });
  }

  static notFound(message = "Recurso no encontrado", details?: Record<string, unknown>) {
    return new AppError(message, { code: "NOT_FOUND", details, statusCode: 404 });
  }

  static conflict(message: string, details?: Record<string, unknown>) {
    return new AppError(message, { code: "CONFLICT", details, statusCode: 409 });
  }

  static validation(message: string, details?: Record<string, unknown>) {
    return new AppError(message, { code: "VALIDATION_ERROR", details, statusCode: 422 });
  }

  static tooManyRequests(message = "Demasiadas solicitudes", details?: Record<string, unknown>) {
    return new AppError(message, { code: "TOO_MANY_REQUESTS", details, statusCode: 429 });
  }

  static internal(message = "Error interno del servidor", details?: Record<string, unknown>) {
    return new AppError(message, { code: "INTERNAL_ERROR", details, statusCode: 500 });
  }

  static fromZodError(error: z.ZodError) {
    const details = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return AppError.validation("Datos de entrada inválidos", { issues: details });
  }
}

export function handleError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return handleError(AppError.fromZodError(error));
  }

  if (error instanceof Error) {
    console.error("Unhandled error:", error);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === "production" ? "Error interno del servidor" : error.message,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: "Error desconocido", code: "UNKNOWN_ERROR" },
    { status: 500 }
  );
}

export function asyncHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  }) as T;
}

export function successResponse<T>(
  data: T,
  message?: string,
  statusCode = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status: statusCode }
  );
}

export function errorResponse(
  message: string,
  statusCode = 500,
  code = "ERROR",
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      details,
    },
    { status: statusCode }
  );
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse {
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}