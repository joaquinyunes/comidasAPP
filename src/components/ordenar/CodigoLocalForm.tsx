"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Puerta de acceso a "pedir en el local": sin QR a mano, el cliente
// puede tipear el código especial que le da un mozo o que está
// impreso en el local (el mismo código del panel de admin).
export default function CodigoLocalForm({ intentoInvalido = false }: { intentoInvalido?: boolean }) {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [vacio, setVacio] = useState(false);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const valor = codigo.trim();
    if (!valor) {
      setVacio(true);
      return;
    }
    router.push(`/pedir-local?codigo=${encodeURIComponent(valor)}`);
  }

  return (
    <form onSubmit={enviar} className="form-pop max-w-sm">
      <p className="form-note">
        Este pedido necesita un código especial que te da un mozo o que está impreso en el local.
      </p>
      {intentoInvalido && <p className="form-error" role="alert">Ese código no es válido. Probá de nuevo.</p>}
      <div className="field-pop">
        <label htmlFor="codigo-local">Código del local</label>
        <input
          id="codigo-local"
          value={codigo}
          onChange={(e) => {
            setCodigo(e.target.value);
            setVacio(false);
          }}
          placeholder="Pedíselo a un mozo"
          autoComplete="off"
        />
      </div>
      {vacio && <p className="form-error" role="alert">Ingresá el código.</p>}
      <button type="submit" className="pop-btn pop-btn-purple w-full">Ingresar</button>
    </form>
  );
}
