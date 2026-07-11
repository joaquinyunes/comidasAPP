# 2.13.2 — Registro de Temperatura de Heladeras

## Descripción
Carga (manual dos veces por turno o automática) de la temperatura de heladeras/freezers para cumplir normas de seguridad alimentaria y tener respaldo ante inspección.

## Dependencias
- `Equipo` tipo heladera, `RegistroTemperatura` (modelo nuevo).

## Contenido
- Carga de temperatura por turno (apertura/cierre) o vía sensor.
- Alerta si sale del rango seguro.
- Historial consultable por fecha para inspección.
- Exportable como reporte de cumplimiento (ver 2.22.1).

## Criterio de validación
- Se registra temperatura por turno o sensor.
- Alerta si fuera de rango.
- El historial es exportable para inspección.
