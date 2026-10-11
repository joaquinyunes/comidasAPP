import { PerspectiveCamera, Scene, WebGLRenderer, type Group } from "three";
import { buildAsteroids } from "./build-asteroids";
import { buildPlanet } from "./build-planet";
import { buildPortal } from "./build-portal";
import { buildSticker } from "./build-sticker";
import { buildStarfield } from "./build-starfield";
import { cameraPose } from "./camera-path";
import { loadTexture } from "./load-texture";
import { layoutForAspect, stickerLayout, type StickerDef } from "./sticker-layout";

export interface HeroSceneOptions {
  host: HTMLElement;
  // Progreso de scroll 0..1 (lo escribe ScrollTrigger).
  getProgress: () => number;
  onReady: () => void;
  // Se llama si WebGL se pierde o el loop falla: el caller muestra el hero
  // estático.
  onFail: () => void;
}

export interface HeroSceneHandle {
  dispose: () => void;
}

interface StickerItem {
  id: string;
  role: "hero" | "product";
  group: Group;
  born: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOutBack = (t: number) => {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

// Escena del hero: túnel de estrellas, planeta con anillo, asteroides, los
// productos como stickers y un portal final. La cámara recorre todo según el
// scroll. Cada pieza se construye en su propio módulo; acá sólo se orquesta.
export function createHeroScene(opts: HeroSceneOptions): HeroSceneHandle {
  const { host, getProgress, onReady, onFail } = opts;

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(46, 1, 0.1, 140);

  let aspect = 1;
  let { spread, anchorX, anchorY } = layoutForAspect(aspect);

  const starfield = buildStarfield(1);
  scene.add(starfield.points, starfield.streaks);

  const planet = buildPlanet(2.1);
  scene.add(planet.group);

  const asteroids = buildAsteroids(16, 1);
  asteroids.forEach((a) => scene.add(a.mesh));

  const portal = buildPortal();
  portal.group.position.set(0, 0, -44);
  scene.add(portal.group);

  const items: StickerItem[] = [];
  let defs = new Map<string, StickerDef>();
  const refreshDefs = () => {
    const l = stickerLayout(spread, anchorX, anchorY);
    defs = new Map([...l.hero, ...l.products].map((d) => [d.id, d]));
  };
  refreshDefs();

  let disposed = false;
  let failed = false;
  let t = 0;
  let heroLoaded = 0;
  let readyFired = false;
  const fireReady = () => {
    if (readyFired || disposed) return;
    readyFired = true;
    onReady();
  };
  const readyTimer = window.setTimeout(fireReady, 2800);

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const addSticker = (def: StickerDef, role: "hero" | "product") => {
    loadTexture(def.src, maxAniso)
      .then((tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }
        const group = buildSticker(tex, 1);
        group.scale.setScalar(0.0001);
        scene.add(group);
        items.push({ id: def.id, role, group, born: t });
        if (role === "hero" && ++heroLoaded >= 2) fireReady();
      })
      .catch(() => {
        // Un sticker que no carga se omite: la escena sigue.
        if (role === "hero" && ++heroLoaded >= 2) fireReady();
      });
  };
  const initial = stickerLayout(spread, anchorX, anchorY);
  initial.hero.forEach((d) => addSticker(d, "hero"));
  initial.products.forEach((d) => addSticker(d, "product"));

  // ---------- Tamaño ----------
  const resize = () => {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    ({ spread, anchorX, anchorY } = layoutForAspect(aspect));
    refreshDefs();
    camera.updateProjectionMatrix();
  };
  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(host);
  resize();

  // ---------- Entrada del usuario ----------
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  // ---------- Visibilidad ----------
  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(host);

  // ---------- Actualización por frame ----------
  let smooth = getProgress();
  let lastTarget = smooth;
  let velocity = 0;

  const update = (dt: number) => {
    const target = getProgress();
    smooth += (target - smooth) * (1 - Math.exp(-dt * 7));
    const raw = (target - lastTarget) / Math.max(dt, 1e-3);
    lastTarget = target;
    velocity += (raw - velocity) * (1 - Math.exp(-dt * 6));

    pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt * 5));
    pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt * 5));

    const pose = cameraPose(smooth, spread);
    camera.position.set(pose.x + pointer.sx * 0.45, pose.y - pointer.sy * 0.25, pose.z);
    camera.lookAt(pose.lookX, pose.lookY, pose.lookZ);
    if (Math.abs(camera.fov - pose.fov) > 0.01) {
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
    }

    starfield.setStretch(Math.min(7, Math.abs(velocity) * 18));

    // Planeta: se corre del camino de la cámara durante el sobrevuelo.
    const push = smoothstep(0.06, 0.3, smooth);
    const planetBaseX = anchorX + 1.1 * spread;
    planet.group.position.set(planetBaseX + push * 6.5, 0.1 + anchorY * 0.6 + push * 1.2, -3);
    const planetScale = Math.max(0.7, spread);
    planet.group.scale.setScalar(planetScale);
    planet.spin.rotation.y = t * 0.12;
    planet.group.rotation.z = -0.22;
    planet.moon.position.set(Math.cos(t * 0.7) * 4.1, Math.sin(t * 0.7) * 1.0, Math.sin(t * 0.7) * 3.2);

    asteroids.forEach((a) => {
      a.mesh.rotation.x += a.spinX * dt;
      a.mesh.rotation.y += a.spinY * dt;
    });

    portal.rings.forEach((r, i) => {
      r.rotation.z = t * (0.35 + i * 0.2) * (i % 2 ? -1 : 1);
    });
    // El portal sólo aparece cuando la cámara ya viene cerca: de lejos
    // taparía el texto del hero con una mancha en el punto de fuga.
    const portalNear = 1 - smoothstep(18, 34, camera.position.z - portal.group.position.z);
    const portalPulse = 1 + Math.sin(t * 1.6) * 0.03;
    portal.group.scale.setScalar(Math.max(0.0001, portalPulse * portalNear));
    portal.group.visible = portalNear > 0.01;

    items.forEach((item) => {
      const def = defs.get(item.id);
      if (!def) return;
      const appear = clamp01((t - item.born) / 0.9);
      const grow = appear > 0 ? easeOutBack(appear) : 0;
      const bob = Math.sin(t * 0.9 + def.floatPhase) * 0.16;
      const g = item.group;

      if (item.role === "hero") {
        // Los stickers del hero salen volando hacia los costados al arrancar
        // el viaje (sentido según su posición respecto del ancla).
        const dir = def.x >= anchorX ? 1 : -1;
        const exit = smoothstep(0.0, 0.17, smooth);
        const depth = item.id === "galaxy-bite" ? 0.55 : 0.9;
        g.position.set(
          def.x + dir * exit * 8 + pointer.sx * depth * 0.6,
          def.y + bob - pointer.sy * depth * 0.3,
          def.z + exit * 3
        );
        g.rotation.set(0, pointer.sx * 0.18 * depth, def.tilt + dir * exit * -1.1 + Math.sin(t * 0.6 + def.floatPhase) * 0.04);
        g.scale.setScalar(def.size * grow * (1 + exit * 0.25));
        g.visible = exit < 0.995;
      } else {
        // Los productos "se materializan" al acercarse la cámara.
        const dist = camera.position.z - def.z;
        const near = 1 - smoothstep(16, 30, dist);
        g.visible = near > 0.01;
        g.position.set(def.x, def.y + bob, def.z);
        const toCam = Math.atan2(camera.position.x - def.x, Math.abs(camera.position.z - def.z) + 4);
        g.rotation.set(0, toCam * 0.6 + pointer.sx * 0.1, def.tilt + Math.sin(t * 0.6 + def.floatPhase) * 0.05);
        g.scale.setScalar(Math.max(0.0001, def.size * grow * near));
      }
    });

    (host.parentElement ?? host).style.setProperty("--hero-progress", smooth.toFixed(3));
  };

  // ---------- Loop ----------
  let raf = 0;
  let last = performance.now();
  let errorCount = 0;

  const fail = () => {
    if (failed) return;
    failed = true;
    cancelAnimationFrame(raf);
    onFail();
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    try {
      update(dt);
      renderer.render(scene, camera);
      errorCount = 0;
    } catch {
      // Aislamiento: un frame fallido no tira la página; con 5 seguidos se
      // abandona la escena y se muestra el hero estático.
      if (++errorCount >= 5) fail();
    }
  };
  raf = requestAnimationFrame(frame);

  const onContextLost = (e: Event) => {
    e.preventDefault();
    fail();
  };
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(readyTimer);
      window.removeEventListener("pointermove", onPointer);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      resizeObs.disconnect();
      io.disconnect();
      scene.traverse((obj) => {
        const mesh = obj as { geometry?: { dispose(): void }; material?: unknown };
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if (!m) return;
          const mat = m as { map?: { dispose(): void } | null; dispose(): void };
          mat.map?.dispose();
          mat.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
