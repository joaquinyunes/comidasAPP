import { SRGBColorSpace, TextureLoader, type Texture } from "three";

const loader = new TextureLoader();

// Carga una textura y la entrega lista (espacio de color sRGB). Rechaza si la
// imagen no existe: quien llama decide qué hacer (un sticker caído no debe
// romper la escena entera).
export function loadTexture(url: string, maxAnisotropy: number): Promise<Texture> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = SRGBColorSpace;
        tex.anisotropy = Math.min(8, maxAnisotropy);
        resolve(tex);
      },
      undefined,
      () => reject(new Error(`No se pudo cargar la textura ${url}`))
    );
  });
}
