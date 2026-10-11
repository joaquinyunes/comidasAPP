"use client";

import type { ReactNode } from "react";
import { SesionProvider } from "./SesionContext";
import CuerpoPanel from "./CuerpoPanel";

// Marco de todo el panel: sesión + navegación + contenido.
export default function PanelShell({ children }: { children: ReactNode }) {
  return (
    <SesionProvider>
      <CuerpoPanel>{children}</CuerpoPanel>
    </SesionProvider>
  );
}
