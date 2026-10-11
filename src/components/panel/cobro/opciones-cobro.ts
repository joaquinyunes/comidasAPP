// Formas de pago y propinas que ofrece el panel, en un único lugar.

export const METODOS_COBRO = [
  { valor: "efectivo", etiqueta: "Efectivo" },
  { valor: "tarjeta", etiqueta: "Tarjeta" },
  { valor: "qr", etiqueta: "QR" },
  { valor: "transferencia", etiqueta: "Transferencia" },
] as const;

export const PROPINAS_COBRO = [
  { valor: "0", etiqueta: "Sin propina" },
  { valor: "10", etiqueta: "10%" },
  { valor: "15", etiqueta: "15%" },
] as const;
