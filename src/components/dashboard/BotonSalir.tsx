"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BotonSalir({ className }: { className?: string }) {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    setSaliendo(true);
    try {
      await fetch("/api/auth/login", { method: "DELETE" });
    } catch {
      // aunque falle, mandamos al login
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={salir}
      disabled={saliendo}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-pn-suave transition-colors hover:bg-pn-hundido hover:text-pn-tinta disabled:opacity-45",
        className
      )}
    >
      <LogOut className="size-4 shrink-0" aria-hidden />
      {saliendo ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
