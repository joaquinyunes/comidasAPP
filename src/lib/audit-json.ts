import type { Prisma } from "@/generated/prisma/client";

/**
 * Serializa un valor arbitrario (modelos Prisma con Date/Decimal, objetos anidados)
 * a JSON plano apto para columnas `Json` de Prisma. Aísla el snapshot de auditoría
 * de cualquier tipo no serializable.
 */
export function aJson(valor: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(valor ?? null)) as Prisma.InputJsonValue;
}
