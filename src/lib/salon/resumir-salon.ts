// Lectura rápida del salón para el mozo: cuántas mesas hay en cada
// situación y a cuáles tiene que ir primero.

export interface MesaMinima {
  id: string;
  numero: string;
  estado: string;
  segundosDesdeCambio: number;
  platosListos: number;
}

const PIDEN_CUENTA = ["esperando_cuenta", "cuenta_solicitada"];
const SIN_CLIENTES = ["libre", "reservada", "limpieza"];

export function pideCuenta(estado: string): boolean {
  return PIDEN_CUENTA.includes(estado);
}

export interface ResumenSalon {
  libres: number;
  ocupadas: number;
  pidenCuenta: number;
  platosParaLlevar: number;
}

export function resumirSalon(mesas: MesaMinima[]): ResumenSalon {
  return {
    libres: mesas.filter((m) => m.estado === "libre").length,
    ocupadas: mesas.filter((m) => !SIN_CLIENTES.includes(m.estado)).length,
    pidenCuenta: mesas.filter((m) => pideCuenta(m.estado)).length,
    platosParaLlevar: mesas.reduce((s, m) => s + m.platosListos, 0),
  };
}

export type MotivoAtencion = "cuenta" | "listos";

export interface Atencion<T extends MesaMinima> {
  mesa: T;
  motivo: MotivoAtencion;
  minutos: number;
}

// Mesas que esperan algo del mozo. Primero las que piden la cuenta
// (el cliente se va), después los platos listos; dentro de cada grupo,
// la que más espera.
export function mesasParaAtender<T extends MesaMinima>(mesas: T[]): Atencion<T>[] {
  const lista: Atencion<T>[] = [];
  for (const mesa of mesas) {
    const minutos = Math.floor(mesa.segundosDesdeCambio / 60);
    if (pideCuenta(mesa.estado)) lista.push({ mesa, motivo: "cuenta", minutos });
    else if (mesa.platosListos > 0) lista.push({ mesa, motivo: "listos", minutos });
  }
  const peso = (a: Atencion<T>) => (a.motivo === "cuenta" ? 0 : 1);
  return lista.sort((a, b) => peso(a) - peso(b) || b.minutos - a.minutos);
}
