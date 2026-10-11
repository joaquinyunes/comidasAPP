import {
  BackSide,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
} from "three";
import { PALETTE } from "./palette";
import { createToonMaterial } from "./toon-material";

export interface Asteroid {
  mesh: Group;
  spinX: number;
  spinY: number;
}

const TONES = [
  { base: PALETTE.red, light: PALETTE.orange, shade: 0x8c1d17 },
  { base: PALETTE.yellow, light: 0xffe08a, shade: PALETTE.orange },
  { base: PALETTE.purpleLight, light: 0xc3a4ff, shade: PALETTE.purple },
];

// Mulberry32: PRNG determinista, así la escena no cambia entre renders.
function rng(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Rocas toon con contorno repartidas a lo largo del túnel: dan profundidad
// y paralaje al pasar la cámara.
export function buildAsteroids(count: number, spread: number): Asteroid[] {
  const rand = rng(7);
  const out: Asteroid[] = [];
  for (let i = 0; i < count; i++) {
    const tone = TONES[i % TONES.length];
    const r = 0.22 + rand() * 0.55;
    const geo = new IcosahedronGeometry(r, 1);
    const body = new Mesh(
      geo,
      createToonMaterial({ ...tone, dots: [18, 9] })
    );
    const outline = new Mesh(
      geo,
      new MeshBasicMaterial({ color: PALETTE.black, side: BackSide })
    );
    outline.scale.setScalar(1.12);

    const mesh = new Group();
    mesh.add(body, outline);

    const side = rand() > 0.5 ? 1 : -1;
    const x = side * (2.6 + rand() * 5.5) * spread;
    mesh.position.set(x, (rand() - 0.5) * 6, 6 - (i / count) * 58 - rand() * 2);
    mesh.rotation.set(rand() * 6, rand() * 6, rand() * 6);

    out.push({ mesh, spinX: (rand() - 0.5) * 0.6, spinY: (rand() - 0.5) * 0.6 });
  }
  return out;
}
