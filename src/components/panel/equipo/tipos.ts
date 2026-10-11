// Forma de lo que devuelven las APIs de RRHH.

export interface EmpleadoApi {
  id: string;
  sucursalId: string;
  cargo: string | null;
  estado: string;
  usuario: { id: string; nombre: string; email: string; telefono: string | null };
}

export interface TurnoApi {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  empleado: { id: string; usuario: { nombre: string } };
}

export interface AsistenciaApi {
  id: string;
  entrada: string | null;
  salida: string | null;
  horasTrabajadas: string | number | null;
  empleado: { usuario: { nombre: string } };
}
