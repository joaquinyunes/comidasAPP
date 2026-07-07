"use client";

import { CalendarioReservas } from "@/components/reservas";
import { useState } from "react";

export default function ReservasPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <CalendarioReservas
        onSeleccionarReserva={(r) => console.log("Reserva:", r)}
        onCrearReserva={() => setShowModal(true)}
      />
    </>
  );
}
