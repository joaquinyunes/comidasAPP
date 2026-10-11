// Recorta el fondo claro de una imagen de producto para poder apoyarla sobre
// la cámara sin un cuadrado blanco alrededor. Flood fill desde los bordes:
// sólo se borra lo claro *conectado* al borde, así los blancos internos del
// plato (platos, espuma, cebolla) se conservan.

const UMBRAL_CLARO = 232;
const LADO_MAX = 640;

function esFondo(d: Uint8ClampedArray, i: number): boolean {
  const o = i * 4;
  if (d[o + 3] < 10) return true;
  return d[o] > UMBRAL_CLARO && d[o + 1] > UMBRAL_CLARO && d[o + 2] > UMBRAL_CLARO;
}

export function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("imagen no disponible"));
    img.src = src;
  });
}

// Devuelve un data URL PNG con el fondo transparente. Rechaza si el canvas
// queda "tainted" (imagen de otro origen sin CORS): el caller usa la original.
export async function quitarFondo(src: string): Promise<string> {
  const img = await cargarImagen(src);
  const escala = Math.min(1, LADO_MAX / Math.max(img.naturalWidth, img.naturalHeight || 1));
  const w = Math.max(1, Math.round((img.naturalWidth || LADO_MAX) * escala));
  const h = Math.max(1, Math.round((img.naturalHeight || LADO_MAX) * escala));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("sin canvas 2d");
  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const visto = new Uint8Array(w * h);
  const pila: number[] = [];

  const empujar = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (visto[i]) return;
    visto[i] = 1;
    if (esFondo(d, i)) pila.push(i);
  };

  for (let x = 0; x < w; x++) {
    empujar(x, 0);
    empujar(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    empujar(0, y);
    empujar(w - 1, y);
  }
  while (pila.length) {
    const i = pila.pop() as number;
    d[i * 4 + 3] = 0;
    const x = i % w;
    const y = (i - x) / w;
    empujar(x + 1, y);
    empujar(x - 1, y);
    empujar(x, y + 1);
    empujar(x, y - 1);
  }

  // Recorte al contenido visible: así el ancho de la imagen es el ancho real
  // del plato y la cota en cm coincide con lo que se ve.
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
  if (maxX < minX || maxY < minY) return canvas.toDataURL("image/png");

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const recorte = document.createElement("canvas");
  recorte.width = cw;
  recorte.height = ch;
  recorte.getContext("2d")?.drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);
  return recorte.toDataURL("image/png");
}
