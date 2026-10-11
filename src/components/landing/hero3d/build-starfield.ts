import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  LineSegments,
  Points,
  PointsMaterial,
  ShaderMaterial,
  SRGBColorSpace,
} from "three";
import { PALETTE } from "./palette";

export interface Starfield {
  points: Points;
  streaks: LineSegments;
  // Estira las estelas (0 = quietas) y ajusta su opacidad.
  setStretch(stretch: number): void;
}

const STAR_COUNT = 1600;
const Z_NEAR = 14;
const Z_FAR = -62;
const TINTS = [PALETTE.white, PALETTE.yellow, 0xc3a4ff, 0xffb3ad].map((c) => new Color(c));

function roundSprite(): CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.85)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

const STREAK_VERTEX = /* glsl */ `
  attribute float aSide;
  attribute vec3 aColor;
  uniform float uStretch;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    vec3 p = position;
    p.z += aSide * uStretch;
    vColor = aColor;
    vFade = 1.0 - aSide * 0.85;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const STREAK_FRAGMENT = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    gl_FragColor = vec4(vColor, uOpacity * vFade);
  }
`;

// Túnel de estrellas: puntos redondos + estelas que se estiran con la
// velocidad de scroll (efecto "warp"). Posiciones deterministas.
export function buildStarfield(spread: number): Starfield {
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < STAR_COUNT; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = 2.2 + Math.pow(rand(), 0.7) * 20;
    positions[i * 3] = Math.cos(angle) * radius * (0.6 + 0.4 * spread);
    positions[i * 3 + 1] = Math.sin(angle) * radius * 0.7;
    positions[i * 3 + 2] = Z_FAR + rand() * (Z_NEAR - Z_FAR);
    const tint = TINTS[Math.floor(rand() * TINTS.length)];
    colors[i * 3] = tint.r;
    colors[i * 3 + 1] = tint.g;
    colors[i * 3 + 2] = tint.b;
  }

  const pointsGeo = new BufferGeometry();
  pointsGeo.setAttribute("position", new BufferAttribute(positions, 3));
  pointsGeo.setAttribute("color", new BufferAttribute(colors, 3));
  const points = new Points(
    pointsGeo,
    new PointsMaterial({
      size: 0.16,
      sizeAttenuation: true,
      vertexColors: true,
      map: roundSprite(),
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
  );

  // Estelas: 2 vértices por estrella (cabeza y cola).
  const linePos = new Float32Array(STAR_COUNT * 6);
  const lineColor = new Float32Array(STAR_COUNT * 6);
  const side = new Float32Array(STAR_COUNT * 2);
  for (let i = 0; i < STAR_COUNT; i++) {
    for (let v = 0; v < 2; v++) {
      const o = (i * 2 + v) * 3;
      linePos[o] = positions[i * 3];
      linePos[o + 1] = positions[i * 3 + 1];
      linePos[o + 2] = positions[i * 3 + 2];
      lineColor[o] = colors[i * 3];
      lineColor[o + 1] = colors[i * 3 + 1];
      lineColor[o + 2] = colors[i * 3 + 2];
      side[i * 2 + v] = v;
    }
  }
  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute("position", new BufferAttribute(linePos, 3));
  lineGeo.setAttribute("aColor", new BufferAttribute(lineColor, 3));
  lineGeo.setAttribute("aSide", new BufferAttribute(side, 1));
  const streakMat = new ShaderMaterial({
    vertexShader: STREAK_VERTEX,
    fragmentShader: STREAK_FRAGMENT,
    uniforms: { uStretch: { value: 0 }, uOpacity: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const streaks = new LineSegments(lineGeo, streakMat);
  streaks.frustumCulled = false;

  return {
    points,
    streaks,
    setStretch(stretch: number) {
      streakMat.uniforms.uStretch.value = stretch;
      streakMat.uniforms.uOpacity.value = Math.min(0.85, stretch * 0.22);
    },
  };
}
