# Kit del restaurante piloto (V10)

El piloto es **una persona real** que acepta probar el sistema (con seña o uso real). Hasta que exista, no se construye para otro rubro. **Este kit está listo; el piloto real no existe todavía.**

## Checklist de arranque
- [ ] Restaurante elegido y acuerdo firmado (borrador abajo).
- [ ] Despliegue propio con cuentas **a nombre del cliente** (`docs/DESPLIEGUE-CLIENTE.md`) y `verificar-despliegue.mjs` en verde.
- [ ] Administrador con 2FA activo; roles revisados (mozo, cocina, caja).
- [ ] Carta, mesas y zonas cargadas; QR del local impreso con **su** `QR_LOCAL_CODIGO`.
- [ ] Mercado Pago en **modo prueba** primero: pago aprobado, aviso repetido, monto menor, reembolso.
- [ ] Backup restaurado una vez y anotado (`docs/BACKUPS.md`); aviso de caída activo (`scripts/uptime.sh`).
- [ ] Capacitación de 1 hora al personal con `docs/MANUAL-DEL-RESTAURANTE.md`.

## Métricas (3 días de uso real, anotar cada día)
| Métrica | Cómo se mide | Día 1 | Día 2 | Día 3 |
|---|---|---|---|---|
| Pedidos cargados por el sistema / total del día | cuaderno vs. panel | | | |
| Tiempo carga→cocina (promedio) | eventos del pedido | | | |
| Cobros con diferencia de caja | cierre de caja | | | |
| Pedidos con error o corrección manual | anotación del encargado | | | |
| Caídas o lentitud | uptime + relato del personal | | | |
| ¿Lo usarían sin nosotros al lado? (sí/no, por rol) | pregunta directa | | | |

**Criterio de éxito sugerido:** 3 días sin pérdida de pedidos, caja cerrando sin diferencias inexplicadas y que el encargado diga que lo seguiría usando.

## Contrato de piloto — BORRADOR (revisar con un abogado antes de firmar)
1. **Objeto:** uso de prueba del sistema de gestión de restaurante durante [3/30] días en [local].
2. **Precio:** [seña de $__ / sin costo], descontable del paquete si decide contratar.
3. **Datos:** los datos del restaurante son suyos; se exportan o borran a pedido al terminar. El estudio no los usa para otro fin.
4. **Cuentas:** dominio, base y pagos a nombre del cliente; el estudio no conserva claves.
5. **Soporte:** respuesta en [horario] durante el piloto; sin garantía de disponibilidad fuera de ese plazo.
6. **Resultado:** el cliente autoriza [sí/no] a citar el resultado (métricas, sin datos de clientes) como caso de éxito.
7. **Salida:** cualquiera puede terminar con aviso por escrito; no hay penalidad.
8. **Ley aplicable y datos personales:** Ley 25.326 (Argentina). [Cláusulas a completar por el abogado.]
