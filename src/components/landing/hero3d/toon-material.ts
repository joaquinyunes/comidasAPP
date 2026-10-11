import { Color, ShaderMaterial } from "three";

const VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Sombreado por bandas (3 tonos) + trama de puntos en la zona oscura: el
// mismo lenguaje halftone de las ilustraciones de la landing.
const FRAGMENT = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uLight;
  uniform vec3 uShade;
  uniform vec2 uDots;
  uniform float uBands;
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    float l = dot(normalize(vNormal), normalize(vec3(-0.55, 0.65, 0.6)));
    vec3 color = uBase;
    if (uBands > 0.0) {
      float band = step(0.5, fract(vUv.y * uBands + sin(vUv.x * 12.566) * 0.12));
      color = mix(uBase, uLight, band * 0.35);
    }
    if (l > 0.5) color = mix(color, uLight, 0.75);
    vec2 cell = fract(vUv * uDots) - 0.5;
    float radius = mix(0.0, 0.46, smoothstep(0.25, -0.45, l));
    float dots = step(length(cell), radius);
    color = mix(color, uShade, dots);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface ToonOptions {
  base: number;
  light: number;
  shade: number;
  dots?: [number, number];
  bands?: number;
}

export function createToonMaterial(opts: ToonOptions): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: {
      uBase: { value: new Color(opts.base) },
      uLight: { value: new Color(opts.light) },
      uShade: { value: new Color(opts.shade) },
      uDots: { value: opts.dots ?? [64, 32] },
      uBands: { value: opts.bands ?? 0 },
    },
  });
}
