"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Boton from "@/components/panel/ui/Boton";

// Cierra la sesión en todos los dispositivos (por si se perdió un celular o una compu).
export default function CerrarTodasLasSesiones() {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);

  async function cerrar() {
    setOcupado(true);
    try {
      await fetch("/api/auth/login?todas=1", { method: "DELETE" });
    } catch {
      // igual mandamos al login
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <Boton variante="secundario" className="w-full" onClick={cerrar} disabled={ocupado}>
      {ocupado ? "Cerrando…" : "Cerrar sesión en todos mis dispositivos"}
    </Boton>
  );
}
