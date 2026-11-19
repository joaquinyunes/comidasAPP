// Topes del pedido en mesa (QR del local), en base de datos para valer con varias instancias:
//  - adivinar el código: 10 códigos incorrectos en 10 min desde una IP la bloquean.
//  - inundar la cocina: 30 pedidos en 10 min a la misma mesa (aunque cambie la IP) y 30 por IP (aunque
//    cambie la «referencia», que es texto libre del cliente); tope global del local: 300 en 10 min.
import { contarIntento, leerIntentos } from "@/lib/limite-intentos";

const VENTANA_MS = 10 * 60_000;
const MAX_CODIGOS_MALOS = 10;
const MAX_PEDIDOS_POR_MESA = 30;
const MAX_PEDIDOS_POR_IP = 30;
const MAX_PEDIDOS_DEL_LOCAL = 300;

export interface Tope { bloqueado: boolean; espera: number }

export async function ipBloqueadaPorCodigo(ip: string): Promise<Tope> {
  const { n, espera } = await leerIntentos(`qr-codigo:${ip}`, VENTANA_MS);
  return { bloqueado: n >= MAX_CODIGOS_MALOS, espera };
}

export async function registrarCodigoMalo(ip: string): Promise<void> {
  await contarIntento(`qr-codigo:${ip}`, VENTANA_MS);
}

// «Mesa 5», «mesa-5» y «MESA5» son la misma mesa.
export const normalizarReferencia = (r: string): string => r.toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, "").slice(0, 50) || "sin-referencia";

// Cuenta un pedido contra los tres topes; bloquea si cualquiera se pasó.
export async function contarPedidoDeMesa(referencia: string, ip: string): Promise<Tope> {
  const [mesa, porIp, local] = await Promise.all([
    contarIntento(`qr-mesa:${normalizarReferencia(referencia)}`, VENTANA_MS),
    contarIntento(`qr-pedidos-ip:${ip}`, VENTANA_MS),
    contarIntento("qr-pedidos-local", VENTANA_MS),
  ]);
  const bloqueado = mesa.n > MAX_PEDIDOS_POR_MESA || porIp.n > MAX_PEDIDOS_POR_IP || local.n > MAX_PEDIDOS_DEL_LOCAL;
  return { bloqueado, espera: Math.max(mesa.espera, porIp.espera, local.espera) };
}
