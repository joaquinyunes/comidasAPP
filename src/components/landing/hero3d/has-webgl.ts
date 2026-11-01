// Detecta soporte de WebGL sin dejar un contexto colgado. Con ahorro de datos
// (`saveData`) devuelve false: así no se descarga three.js ni las texturas.
export function hasWebgl(): boolean {
  if (typeof document === "undefined") return false;
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
