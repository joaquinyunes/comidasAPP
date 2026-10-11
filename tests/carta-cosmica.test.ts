import { describe, expect, it } from "vitest";
import { temaDeCategoria } from "@/components/carta/tema-categoria";
import { formatearPrecio } from "@/components/carta/formatear-precio";
import { elegirOrbita } from "@/components/carta/elegir-orbita";
import {
  ajustarAlPaso,
  indiceFrente,
  pasoGrados,
  profundidad,
} from "@/components/carta/orbita-geometria";
import {
  PERSPECTIVA,
  SEPARACION,
  avanceMundo,
  opacidadPorProfundidad,
  opacidadRotulo,
  posicionMeteoro,
  posicionPlaneta,
  sectorActual,
} from "@/components/carta/viaje-geometria";
import {
  INTRO,
  capituloActual,
  duracion,
  fases,
  inicioCapitulo,
} from "@/components/nosotros/historia-ritmo";
import type { CategoriaLanding, ProductoLanding } from "@/lib/landing-data";

function prod(id: string, extra: Partial<ProductoLanding> = {}): ProductoLanding {
  return { id, nombre: id, precio: 100, alergenos: [], imagenUrl: `/${id}.svg`, ...extra };
}

function cat(id: string, productos: ProductoLanding[]): CategoriaLanding {
  return { id, nombre: id, productos };
}

describe("temaDeCategoria", () => {
  it("reconoce categorías por palabra, sin importar tildes ni mayúsculas", () => {
    expect(temaDeCategoria("PIZZAS", 0).planeta).toBe("Magma");
    expect(temaDeCategoria("Empanadas criollas", 3).planeta).toBe("Plasma");
    expect(temaDeCategoria("Cervezas Artesanales", 9).planeta).toBe("Ámbar");
  });

  it("usa un tema de respaldo estable para categorías desconocidas", () => {
    const a = temaDeCategoria("Ensaladas", 0);
    const b = temaDeCategoria("Ensaladas", 0);
    expect(a).toEqual(b);
    expect(temaDeCategoria("Ensaladas", 1)).not.toEqual(a);
  });

  it("no revienta con índices negativos o enormes", () => {
    expect(temaDeCategoria("Combos", -3).color1).toMatch(/^#/);
    expect(temaDeCategoria("Combos", 10_000).color1).toMatch(/^#/);
  });
});

describe("formatearPrecio", () => {
  it("acepta número y string (Decimal serializado)", () => {
    expect(formatearPrecio(6500)).toBe("$6.500");
    expect(formatearPrecio("6500")).toBe("$6.500");
    expect(formatearPrecio("1234.6")).toBe("$1.235");
  });

  it("devuelve un guion si no hay precio válido", () => {
    expect(formatearPrecio(null)).toBe("—");
    expect(formatearPrecio(undefined)).toBe("—");
    expect(formatearPrecio("abc")).toBe("—");
  });
});

describe("elegirOrbita", () => {
  it("prioriza destacados y después reparte entre categorías", () => {
    const carta = [
      cat("a", [prod("a1"), prod("a2", { destacado: true }), prod("a3")]),
      cat("b", [prod("b1"), prod("b2")]),
    ];
    const ids = elegirOrbita(carta, 4).map((p) => p.id);
    expect(ids[0]).toBe("a2");
    expect(ids).toEqual(["a2", "a1", "b1", "b2"]);
  });

  it("ignora productos sin foto y respeta el máximo", () => {
    const carta = [cat("a", [prod("a1", { imagenUrl: null }), prod("a2"), prod("a3")])];
    expect(elegirOrbita(carta, 1).map((p) => p.id)).toEqual(["a2"]);
  });

  it("no repite productos", () => {
    const carta = [cat("a", [prod("a1", { destacado: true }), prod("a2")])];
    const ids = elegirOrbita(carta, 8).map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("devuelve vacío con carta vacía", () => {
    expect(elegirOrbita([])).toEqual([]);
  });
});

describe("geometría de la órbita", () => {
  it("reparte el anillo en pasos iguales", () => {
    expect(pasoGrados(8)).toBe(45);
    expect(pasoGrados(0)).toBe(360);
  });

  it("el plato del frente tiene profundidad 1 y el opuesto 0", () => {
    expect(profundidad(0, 45, 0)).toBeCloseTo(1);
    expect(profundidad(4, 45, 0)).toBeCloseTo(0);
  });

  it("calcula qué plato está al frente según la rotación", () => {
    expect(indiceFrente(0, 45, 8)).toBe(0);
    expect(indiceFrente(-45, 45, 8)).toBe(1);
    expect(indiceFrente(-360, 45, 8)).toBe(0);
    expect(indiceFrente(45, 45, 8)).toBe(7);
  });

  it("ajusta al múltiplo más cercano del paso", () => {
    expect(ajustarAlPaso(-50, 45)).toBe(-45);
    expect(ajustarAlPaso(70, 45)).toBe(90);
  });
});

describe("geometría del viaje", () => {
  it("los planetas se ubican cada vez más lejos y alternando de lado", () => {
    const [a, b, c] = [0, 1, 2].map(posicionPlaneta);
    expect(a.z).toBeGreaterThan(b.z);
    expect(b.z).toBeGreaterThan(c.z);
    expect(Math.sign(a.x)).not.toBe(Math.sign(b.x));
  });

  it("los meteoros quedan dentro del recorrido", () => {
    for (let m = 0; m < 9; m++) {
      const { z } = posicionMeteoro(m, 9, 6);
      expect(z).toBeLessThan(0);
      expect(z).toBeGreaterThan(-(6.5 * SEPARACION) - 200);
    }
  });

  it("el avance es 0 al inicio y llega más allá del último planeta", () => {
    expect(avanceMundo(0, 6)).toBe(0);
    expect(avanceMundo(1, 6)).toBeGreaterThan(6 * SEPARACION);
    expect(avanceMundo(5, 6)).toBe(avanceMundo(1, 6));
  });

  it("la opacidad es 0 muy lejos, 1 a distancia media y 0 al pasar encima", () => {
    expect(opacidadPorProfundidad(-10 * SEPARACION)).toBe(0);
    expect(opacidadPorProfundidad(-SEPARACION)).toBe(1);
    expect(opacidadPorProfundidad(PERSPECTIVA)).toBe(0);
    const entre = opacidadPorProfundidad(-3 * SEPARACION);
    expect(entre).toBeGreaterThan(0);
    expect(entre).toBeLessThan(1);
  });

  it("el rótulo se apaga cuando el planeta está encima", () => {
    expect(opacidadRotulo(-SEPARACION * 2)).toBe(1);
    expect(opacidadRotulo(0)).toBe(0);
  });

  it("el sector actual avanza con el progreso y no se sale de rango", () => {
    expect(sectorActual(0, 6)).toBe(0);
    expect(sectorActual(1, 6)).toBe(5);
    const medio = sectorActual(0.5, 6);
    expect(medio).toBeGreaterThan(0);
    expect(medio).toBeLessThan(5);
    expect(sectorActual(0.5, 0)).toBe(0);
  });
});

describe("ritmo de la historia", () => {
  it("la duración es la intro más un tramo por capítulo", () => {
    expect(duracion(4)).toBeCloseTo(INTRO + 4);
    expect(duracion(0)).toBeCloseTo(INTRO);
    expect(inicioCapitulo(0)).toBeCloseTo(INTRO);
    expect(inicioCapitulo(2)).toBeCloseTo(INTRO + 2);
  });

  it("cada capítulo entra antes de salir y el último no sale", () => {
    const f = fases(1, 4);
    expect(f.laminaEntra.desde).toBeLessThan(f.laminaEntra.hasta);
    expect(f.sale).not.toBeNull();
    expect(f.sale!.desde).toBeGreaterThan(f.textoEntra.hasta);
    expect(fases(3, 4).sale).toBeNull();
  });

  it("no hay capítulo activo durante la intro y el último queda al final", () => {
    expect(capituloActual(0, 4)).toBeNull();
    expect(capituloActual(1, 4)).toBe(3);
    expect(capituloActual(0.5, 4)).toBeGreaterThanOrEqual(0);
    expect(capituloActual(0.5, 0)).toBeNull();
  });

  it("los capítulos aparecen en orden al avanzar el progreso", () => {
    let previo = -1;
    for (let p = 0; p <= 1; p += 0.02) {
      const c = capituloActual(p, 4);
      if (c !== null) {
        expect(c).toBeGreaterThanOrEqual(previo);
        previo = c;
      }
    }
  });
});
