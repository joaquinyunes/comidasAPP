import { describe, it, expect } from "vitest";
import { cameraPose, CAMERA_START_Z, CAMERA_END_Z } from "@/components/landing/hero3d/camera-path";
import { layoutForAspect, stickerLayout } from "@/components/landing/hero3d/sticker-layout";

describe("cameraPose", () => {
  it("arranca y termina en los extremos del recorrido", () => {
    expect(cameraPose(0).z).toBeCloseTo(CAMERA_START_Z);
    expect(cameraPose(1).z).toBeCloseTo(CAMERA_END_Z);
  });

  it("avanza siempre hacia adelante (z decrece)", () => {
    let prev = cameraPose(0).z;
    for (let i = 1; i <= 20; i++) {
      const z = cameraPose(i / 20).z;
      expect(z).toBeLessThan(prev);
      prev = z;
    }
  });

  it("acota el progreso fuera de rango", () => {
    expect(cameraPose(-3).z).toBeCloseTo(CAMERA_START_Z);
    expect(cameraPose(9).z).toBeCloseTo(CAMERA_END_Z);
  });

  it("achica el balanceo lateral con spread chico", () => {
    const wide = Math.abs(cameraPose(0.15, 1).x);
    const narrow = Math.abs(cameraPose(0.15, 0.45).x);
    expect(narrow).toBeLessThan(wide);
  });
});

describe("layoutForAspect / stickerLayout", () => {
  it("centra la escena en pantallas verticales", () => {
    expect(layoutForAspect(0.5).anchorX).toBe(0);
    expect(layoutForAspect(1.8).anchorX).toBeGreaterThan(0);
  });

  it("deja los productos del recorrido detrás de la cámara inicial", () => {
    const { products } = stickerLayout(1, 2.5);
    products.forEach((p) => expect(p.z).toBeLessThan(CAMERA_START_Z));
  });
});
