// Topes del pedido en mesa (QR del local), en base de datos para valer con varias instancias:
//  - adivinar el código: 10 códigos incorrectos en 10 min desde una IP la bloquean.
//  - inundar la cocina: 30 pedidos en 10 min a la misma mesa, aunque cambie la IP.
import { contarIntento, leerIntentos } from "@/lib/limite-intentos";

const VENTANA_MS = 10 * 60_000;
const MAX_CODIGOS_MALOS = 10;
const MAX_PEDIDOS_POR_MESA = 30;

export interface Tope { bloqueado: boolean; espera: number }

export async function ipBloqueadaPorCodigo(ip: string): Promise<Tope> {
  const { n, espera } = await leerIntentos(`qr-codigo:${ip}`, VENTANA_MS);
  return { bloqueado: n >= MAX_CODIGOS_MALOS, espera };
}

export async function registrarCodigoMalo(ip: string): Promise<void> {
  await contarIntento(`qr-codigo:${ip}`, VENTANA_MS);
}

export async function contarPedidoDeMesa(referencia: string): Promise<Tope> {
  const { n, espera } = await contarIntento(`qr-mesa:${referencia}`, VENTANA_MS);
  return { bloqueado: n > MAX_PEDIDOS_POR_MESA, espera };
}
