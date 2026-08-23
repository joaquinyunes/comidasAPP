import { ImageResponse } from "next/og";

export const alt = "Cozizina — Comida al estilo cósmico";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#F6BE3B",
          color: "#111111",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 140, fontWeight: 900, letterSpacing: -4 }}>COZIZINA</div>
        <div style={{ fontSize: 40, marginTop: 8, opacity: 0.8 }}>
          Comida al estilo cósmico · Buenos Aires
        </div>
      </div>
    ),
    { ...size }
  );
}
