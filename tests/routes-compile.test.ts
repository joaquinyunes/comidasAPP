import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const API_DIR = path.resolve(__dirname, "../src/app/api");

function findRouteFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findRouteFiles(full, acc);
    } else if (entry.name === "route.ts") {
      acc.push(full);
    }
  }
  return acc;
}

const routeFiles = findRouteFiles(API_DIR).sort();

function toAlias(file: string): string {
  const rel = path.relative(path.resolve(__dirname, "../src"), file).replace(/\\/g, "/");
  return "@/" + rel.replace(/\.ts$/, "");
}

describe("Todas las rutas API compilan y exportan handlers", () => {
  it(`debe encontrar rutas (encontradas: ${routeFiles.length})`, () => {
    expect(routeFiles.length).toBeGreaterThan(50);
  });

  for (const file of routeFiles) {
    const alias = toAlias(file);
    it(`compila y exporta handlers: ${alias}`, async () => {
      const mod = await import(alias);
      const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
      const exported = methods.filter((m) => typeof mod[m] === "function");
      expect(exported.length).toBeGreaterThan(0);
    });
  }
});
