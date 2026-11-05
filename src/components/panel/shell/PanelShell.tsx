"use client";

import type { ReactNode } from "react";
import { SesionProvider } from "./SesionContext";
import CuerpoPanel from "./CuerpoPanel";
import RenovarSesion from "@/components/dashboard/RenovarSesion";

// Marco de todo el panel: sesión + navegación + contenido.
export default function PanelShell({ children }: { children: ReactNode }) {
  return (
    <SesionProvider>
      <RenovarSesion />
      <CuerpoPanel>{children}</CuerpoPanel>
    </SesionProvider>
  );
}
