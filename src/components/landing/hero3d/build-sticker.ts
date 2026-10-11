import {
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  type Texture,
} from "three";
import { PALETTE } from "./palette";

const OUTLINE_STEPS = 10;
const OUTLINE_RADIUS = 0.011;
const SHADOW_OFFSET = 0.03;

// Un producto como "sticker" 3D: la imagen con su contorno negro grueso
// (silueta repetida alrededor) y sombra dura desplazada, igual que el
// drop-shadow(6px 6px 0 negro) del resto de la landing.
export function buildSticker(texture: Texture, width: number): Group {
  const img = texture.image as { width: number; height: number };
  const height = width * (img.height / img.width);
  const geo = new PlaneGeometry(width, height);

  const silhouette = () =>
    new MeshBasicMaterial({
      color: PALETTE.black,
      map: texture,
      transparent: true,
      alphaTest: 0.4,
    });

  const group = new Group();

  const shadow = new Mesh(geo, silhouette());
  shadow.position.set(SHADOW_OFFSET, -SHADOW_OFFSET, -0.02);
  group.add(shadow);

  for (let i = 0; i < OUTLINE_STEPS; i++) {
    const a = (i / OUTLINE_STEPS) * Math.PI * 2;
    const edge = new Mesh(geo, silhouette());
    edge.position.set(Math.cos(a) * OUTLINE_RADIUS, Math.sin(a) * OUTLINE_RADIUS, -0.01);
    group.add(edge);
  }

  const face = new Mesh(
    geo,
    new MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.4 })
  );
  group.add(face);

  return group;
}
