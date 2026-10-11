import { SITE } from "@/config/site";

export interface Local {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  horario: string;
}

// Locales de Cozizina: única fuente para /ubicaciones y el mapa del home.
export const LOCALES: readonly Local[] = [
  {
    id: "palermo",
    nombre: "Palermo",
    direccion: "Av. Corrientes 1234, CABA",
    telefono: SITE.contacto.telefono,
    horario: "Lun a Jue 12:00–00:00 · Vie y Sáb 12:00–02:00 · Dom 18:00–00:00",
  },
  {
    id: "villa-crespo",
    nombre: "Villa Crespo",
    direccion: "Av. Corrientes 5600, CABA",
    telefono: SITE.contacto.telefono,
    horario: "Lun a Jue 12:00–00:00 · Vie y Sáb 12:00–02:00 · Dom 18:00–00:00",
  },
];
