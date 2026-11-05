// V2: costo total a 3 años de Cozizina contra Fudo y contra vender por apps de delivery.
// Uso: node scripts/tabla-3-anios.mjs [ventasAppsMensualesARS]
// Todos los precios son entradas editables (ver docs/VENTA-PRECIOS.md para fuente y fecha).
const MESES = 36;

export const P = {
  // Fudo, fu.do/precios, leído el 05/11/2026 (ARS por mes, precio final con impuestos)
  fudo: { avanzado: 43900, facturacionElectronica: 13500, gestionMesas: 8500, descAnual: 0.15 },
  // Tipo de cambio de referencia: dólar blue venta, Bloomberg Línea, 29/09/2026 (REEMPLAZAR por el del día)
  arsPorUsd: 1565,
  // Cozizina: propuesta a validar con un comprador real (docs/VENTA-PRECIOS.md)
  cozizina: { instalacion: 3500, mensual: 120, completo: 10000, mesesIncluidosEnCompleto: 12 },
  // Comisión de apps de delivery (fuente comercial, 24/03/2026): PedidosYa 20–30 %, Rappi 18–28 %
  comisionApp: 0.2,
  // Costo de cobrar con Mercado Pago en el canal propio (rango de un comparador de terceros: 1,49–6,29 % + IVA)
  costoMp: 0.03,
};

export function calcular(ventasAppsMensualesArs = 0, p = P) {
  const fudoMes = p.fudo.avanzado + p.fudo.facturacionElectronica + p.fudo.gestionMesas;
  const fudoMensual = fudoMes * MESES;
  const fudoAnual = fudoMensual * (1 - p.fudo.descAnual);
  const aUsd = (ars) => ars / p.arsPorUsd;

  const cInstMensual = p.cozizina.instalacion + p.cozizina.mensual * MESES;
  const cCompleto = p.cozizina.completo + p.cozizina.mensual * (MESES - p.cozizina.mesesIncluidosEnCompleto);

  // Ahorro mensual si las ventas por apps pasan al canal propio (comisión de la app − costo de cobrar con MP)
  const ahorroPorMesUsd = aUsd(ventasAppsMensualesArs) * (p.comisionApp - p.costoMp);
  const difCompletoVsFudoUsd = cCompleto - aUsd(fudoAnual);
  const ventasEquilibrioUsd = difCompletoVsFudoUsd / MESES / (p.comisionApp - p.costoMp);

  return {
    fudoMes,
    fudoMensualUsd: aUsd(fudoMensual),
    fudoAnualUsd: aUsd(fudoAnual),
    cozizinaInstalacionMasMensualUsd: cInstMensual,
    cozizinaCompletoUsd: cCompleto,
    ahorroPorMesUsd,
    ahorro3AniosUsd: ahorroPorMesUsd * MESES,
    ventasEquilibrioMensualUsd: ventasEquilibrioUsd,
    ventasEquilibrioMensualArs: ventasEquilibrioUsd * p.arsPorUsd,
  };
}

if (process.argv[1]?.endsWith("tabla-3-anios.mjs")) {
  const r = calcular(Number(process.argv[2] ?? 0));
  const f = (n) => Math.round(n).toLocaleString("es-AR");
  console.log(`Fudo (Avanzado + factura electrónica + mesas): ARS ${f(r.fudoMes)}/mes`);
  console.log(`  36 meses pagando por mes:  USD ${f(r.fudoMensualUsd)}`);
  console.log(`  36 meses con pago anual (−15 %): USD ${f(r.fudoAnualUsd)}`);
  console.log(`Cozizina Instalación + Mensual 36 meses: USD ${f(r.cozizinaInstalacionMasMensualUsd)}`);
  console.log(`Cozizina Completo (12 meses incluidos + 24 de Mensual): USD ${f(r.cozizinaCompletoUsd)}`);
  console.log(`Ventas por apps que hay que mover al canal propio para empatar con Fudo: USD ${f(r.ventasEquilibrioMensualUsd)}/mes (ARS ${f(r.ventasEquilibrioMensualArs)})`);
  if (process.argv[2]) console.log(`Ahorro por comisiones con esas ventas: USD ${f(r.ahorroPorMesUsd)}/mes, USD ${f(r.ahorro3AniosUsd)} en 3 años`);
}
