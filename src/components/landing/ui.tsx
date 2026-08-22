"use client";

import type { ReactNode } from "react";

interface StickerProps {
  children?: ReactNode;
  label?: string;
  color?: "yellow" | "purple" | "red" | "orange";
  className?: string;
  style?: React.CSSProperties;
}

function useColor(color?: StickerProps["color"]) {
  switch (color) {
    case "purple": return "#5D23C7";
    case "red": return "#EF4136";
    case "orange": return "#F89B28";
    default: return "#F6BE3B";
  }
}

// Sticker / badge con efecto sticker: borde negro + relleno + sombra dibujada.
export function Sticker({ label, color, className = "", style }: StickerProps) {
  return (
    <span
      className={`sticker ${className}`}
      style={{ ...style, background: useColor(color) }}
    >
      {label}
    </span>
  );
}

interface SectionTitleProps {
  eyebrow: string;
  eyebrowColor?: string;
  titleA: string;
  titleB?: string;
  titleBColor?: string;
  align?: "left" | "center";
  id?: string;
}

// Titulo de seccion reutilizable con eyebrow + display gigante.
export function SectionTitle({
  eyebrow,
  eyebrowColor = "var(--purple)",
  titleA,
  titleB,
  titleBColor = "var(--red)",
  align = "center",
  id,
}: SectionTitleProps) {
  return (
    <div className={`section-title ${align === "center" ? "section-title-center" : ""}`} id={id}>
      <span className="font-body reveal-up" style={{ fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.16em", textTransform: "uppercase", color: eyebrowColor }}>
        {eyebrow}
      </span>
      <h2 className="font-display section-title-head reveal-up">
        {titleA} {titleB ? <span style={{ color: titleBColor }}>{titleB}</span> : null}
      </h2>
    </div>
  );
}