import { BackSide, Group, Mesh, MeshBasicMaterial, TorusGeometry } from "three";
import { PALETTE } from "./palette";

export interface Portal {
  group: Group;
  rings: Group[];
}

function ring(radius: number, tube: number, color: number): Group {
  const g = new Group();
  const geo = new TorusGeometry(radius, tube, 20, 72);
  g.add(new Mesh(geo, new MeshBasicMaterial({ color })));
  const edge = new Mesh(geo, new MeshBasicMaterial({ color: PALETTE.black, side: BackSide }));
  edge.scale.setScalar(1.06);
  g.add(edge);
  return g;
}

// Portal final: anillos concéntricos por los que "aterriza" la cámara hacia
// la carta.
export function buildPortal(): Portal {
  const group = new Group();
  const rings = [
    ring(3.4, 0.32, PALETTE.yellow),
    ring(2.5, 0.26, PALETTE.red),
    ring(1.7, 0.2, PALETTE.purpleLight),
  ];
  rings.forEach((r, i) => {
    r.position.z = -i * 0.9;
    group.add(r);
  });
  return { group, rings };
}
