import {
  BackSide,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry,
} from "three";
import { PALETTE } from "./palette";
import { createToonMaterial } from "./toon-material";

export interface Planet {
  group: Group;
  spin: Group;
  moon: Group;
}

// Planeta toon con contorno negro (casco invertido), anillo amarillo y una
// luna que lo orbita. Todo el "sticker" en 3D real.
export function buildPlanet(radius: number): Planet {
  const group = new Group();
  const spin = new Group();

  const body = new Mesh(
    new SphereGeometry(radius, 64, 48),
    createToonMaterial({
      base: PALETTE.purple,
      light: PALETTE.purpleLight,
      shade: PALETTE.purpleDeep,
      dots: [72, 36],
      bands: 5,
    })
  );
  const outline = new Mesh(
    new SphereGeometry(radius * 1.045, 48, 36),
    new MeshBasicMaterial({ color: PALETTE.black, side: BackSide })
  );
  spin.add(body);
  group.add(spin, outline);

  // Anillo: dos discos (negro apenas más grande) para el contorno.
  const ringInner = radius * 1.35;
  const ringOuter = radius * 1.85;
  const ring = new Group();
  const ringEdge = new Mesh(
    new RingGeometry(ringInner - 0.09, ringOuter + 0.09, 96),
    new MeshBasicMaterial({ color: PALETTE.black, side: DoubleSide })
  );
  const ringFill = new Mesh(
    new RingGeometry(ringInner, ringOuter, 96),
    new MeshBasicMaterial({ color: PALETTE.yellow, side: DoubleSide })
  );
  ringFill.position.z = 0.01;
  ring.add(ringEdge, ringFill);
  ring.rotation.set(Math.PI / 2.35, 0.25, -0.28);
  group.add(ring);

  const moon = new Group();
  const moonBody = new Mesh(
    new SphereGeometry(radius * 0.22, 32, 24),
    createToonMaterial({
      base: PALETTE.orange,
      light: PALETTE.yellow,
      shade: PALETTE.red,
      dots: [28, 14],
    })
  );
  const moonOutline = new Mesh(
    new SphereGeometry(radius * 0.22 * 1.1, 24, 18),
    new MeshBasicMaterial({ color: PALETTE.black, side: BackSide })
  );
  moon.add(moonBody, moonOutline);
  group.add(moon);

  return { group, spin, moon };
}
