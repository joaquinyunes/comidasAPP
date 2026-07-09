# Módulo: RRHH (Recursos Humanos)

**Depende de**: Identidad y Accesos (Fase 1)

## Fases que implementan este módulo
- **Fase 5**: Empleados, turnos, asistencia, portal del empleado

## Funcionalidades

### Gestión de empleados
- ABM de empleados vinculados a usuarios del sistema
- Datos: nombre, contacto, cargo, fecha de ingreso, salario, contrato
- Historial de cambios de puesto

### Turnos y horarios
- Creación de turnos por empleado y sucursal
- Solicitudes de cambio de turno (empleado → gerente aprueba)
- Vista de calendario de turnos
- Alertas por sobrecarga de turnos

### Asistencia
- Registro de entrada y salida (puede ser manual o por dispositivo)
- Cruce automático con turnos planificados
- Detección de ausentismo
- Horas trabajadas calculadas automáticamente

### Portal del empleado
- Ver turnos asignados
- Solicitar vacaciones
- Consultar recibos de sueldo
- Completar capacitaciones
- Recibir anuncios internos

### Evaluaciones y capacitaciones
- Evaluaciones de desempeño (configurables por tenant)
- Capacitaciones con seguimiento de completado

## Datos que gestiona
Empleados, turnos, asistencia, vacaciones, recibos, evaluaciones

## Reglas de negocio
1. Los datos salariales solo los ve Administrador/Dueño/RRHH
2. La asistencia se cruza con turnos para detectar ausentismo
3. Las vacaciones requieren aprobación
4. Un empleado no puede tener turnos solapados

## Métricas del módulo
- Ausentismo (%)
- Rotación de personal
- Cumplimiento de turnos
- Horas extras por empleado
