"use client";

// ============================================================
// ILUSTRACIONES SVG 100% PROPIAS
// Estilo: Neo Pop-Art / cel-shading / outlines negros 4px /
// colores planos muy saturados. Sin blur, sombras dibujadas.
// ============================================================

const OUT = "#111111";

export function IllustrationBun(props: { size?: number }) {
  return (
    <svg viewBox="0 0 200 140" width={props.size ?? 200} height={props.size ? (props.size * 140) / 200 : 140} aria-hidden="true">
      <ellipse cx="100" cy="118" rx="86" ry="14" fill={OUT} opacity="0.12" />
      <path d="M18 70 C18 28 52 8 100 8 C148 8 182 28 182 70 L182 92 C182 104 174 110 162 110 L38 110 C26 110 18 104 18 92 Z" fill="#F6BE3B" stroke={OUT} strokeWidth="4" />
      <path d="M18 70 C18 28 52 8 100 8 C148 8 182 28 182 70" fill="none" stroke="#F89B28" strokeWidth="6" opacity="0.55" />
      <g fill="#FFF7E7" stroke={OUT} strokeWidth="2">
        <ellipse cx="66" cy="38" rx="7" ry="5" />
        <ellipse cx="98" cy="26" rx="7" ry="5" />
        <ellipse cx="132" cy="38" rx="7" ry="5" />
        <ellipse cx="82" cy="56" rx="6" ry="4" />
        <ellipse cx="118" cy="54" rx="6" ry="4" />
      </g>
      <ellipse cx="100" cy="102" rx="80" ry="10" fill="#FFF7E7" stroke={OUT} strokeWidth="4" />
    </svg>
  );
}

export function IllustrationMeat(props: { size?: number }) {
  return (
    <svg viewBox="0 0 200 120" width={props.size ?? 200} height={props.size ? (props.size * 120) / 200 : 120} aria-hidden="true">
      <ellipse cx="100" cy="104" rx="78" ry="12" fill={OUT} opacity="0.12" />
      <path d="M24 62 C24 38 50 24 100 24 C150 24 176 38 176 62 C176 82 156 94 100 94 C44 94 24 82 24 62 Z" fill="#8A4A2F" stroke={OUT} strokeWidth="4" />
      <path d="M24 62 C24 38 50 24 100 24" fill="none" stroke="#6E3A21" strokeWidth="6" opacity="0.5" />
      <path d="M54 52 C62 48 70 54 78 50 M116 48 C124 54 134 48 142 54" fill="none" stroke="#6E3A21" strokeWidth="4" strokeLinecap="round" />
      <path d="M82 66 C90 62 100 66 110 62" fill="none" stroke="#6E3A21" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="100" cy="86" rx="76" ry="8" fill="#C46A2F" stroke={OUT} strokeWidth="4" />
    </svg>
  );
}

export function IllustrationCheese(props: { size?: number }) {
  return (
    <svg viewBox="0 0 200 120" width={props.size ?? 200} height={props.size ? (props.size * 120) / 200 : 120} aria-hidden="true">
      <ellipse cx="100" cy="104" rx="82" ry="12" fill={OUT} opacity="0.12" />
      <path d="M20 60 L180 60 L168 34 L128 46 L112 26 L86 42 L70 24 L44 40 Z" fill="#FFC800" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d="M20 60 C24 86 44 96 70 94 C94 92 108 100 132 92 C154 84 170 92 180 60 Z" fill="#F6BE3B" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <g fill="#F89B28">
        <circle cx="96" cy="46" r="5" />
        <circle cx="124" cy="36" r="5" />
        <circle cx="64" cy="52" r="5" />
      </g>
    </svg>
  );
}

export function IllustrationTomato(props: { size?: number }) {
  return (
    <svg viewBox="0 0 200 140" width={props.size ?? 200} height={props.size ? (props.size * 140) / 200 : 140} aria-hidden="true">
      <ellipse cx="100" cy="122" rx="80" ry="12" fill={OUT} opacity="0.12" />
      <circle cx="100" cy="72" r="52" fill="#EF4136" stroke={OUT} strokeWidth="4" />
      <circle cx="100" cy="72" r="34" fill="#F04A3E" stroke={OUT} strokeWidth="4" />
      <circle cx="100" cy="72" r="16" fill="#FFE9E5" stroke={OUT} strokeWidth="3" />
      <path d="M100 20 C96 6 88 4 76 2 C84 12 86 18 86 26 M100 20 C104 8 112 6 122 4 C114 12 112 18 112 26" fill="#3F8A4D" stroke={OUT} strokeWidth="3" />
      <g fill="#C22B22">
        <circle cx="80" cy="60" r="5" />
        <circle cx="118" cy="64" r="4" />
        <circle cx="96" cy="96" r="5" />
      </g>
    </svg>
  );
}

export function IllustrationLettuce(props: { size?: number }) {
  return (
    <svg viewBox="0 0 200 120" width={props.size ?? 200} height={props.size ? (props.size * 120) / 200 : 120} aria-hidden="true">
      <ellipse cx="100" cy="106" rx="86" ry="10" fill={OUT} opacity="0.12" />
      <path d="M20 40 C20 16 44 6 64 10 C78 -2 100 -2 114 8 C132 -2 160 6 168 24 C184 24 188 44 178 56 C188 70 176 84 160 84 L40 84 C24 84 12 70 22 56 C12 44 16 24 20 40 Z" fill="#67C158" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d="M34 52 C50 40 70 60 88 46 M66 70 C84 60 106 74 122 60 M110 40 C126 30 144 40 158 34" fill="none" stroke="#3F8A4D" strokeWidth="4" strokeLinecap="round" />
      <path d="M100 56 C104 52 110 52 112 56 C110 62 104 62 100 56 Z" fill="#3F8A4D" />
    </svg>
  );
}

export function IllustrationSauce(props: { size?: number }) {
  return (
    <svg viewBox="0 0 200 120" width={props.size ?? 200} height={props.size ? (props.size * 120) / 200 : 120} aria-hidden="true">
      <ellipse cx="100" cy="106" rx="84" ry="10" fill={OUT} opacity="0.12" />
      <path d="M30 70 C20 40 40 18 66 16 C74 8 92 4 104 10 C124 0 150 8 160 24 C182 24 188 46 176 62 C186 74 178 92 158 92 L44 92 C26 92 18 84 30 70 Z" fill="#EF4136" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d="M44 34 C58 28 74 40 90 30 M120 24 C134 20 146 32 158 28 M36 66 C52 60 70 72 88 62" fill="none" stroke="#C22B22" strokeWidth="4" strokeLinecap="round" />
      <circle cx="140" cy="60" r="6" fill="#F6BE3B" stroke={OUT} strokeWidth="3" />
    </svg>
  );
}

export function IllustrationSaturnBurrito(props: { size?: number }) {
  return (
    <svg viewBox="0 0 200 160" width={props.size ?? 200} height={props.size ? (props.size * 160) / 200 : 160} aria-hidden="true">
      <ellipse cx="100" cy="146" rx="82" ry="10" fill={OUT} opacity="0.12" />
      <ellipse cx="100" cy="78" rx="96" ry="24" fill="none" stroke={OUT} strokeWidth="10" />
      <ellipse cx="100" cy="78" rx="86" ry="18" fill="none" stroke="#F89B28" strokeWidth="5" />
      <path d="M36 80 C36 40 66 24 100 24 C134 24 164 40 164 80 L164 96 C164 112 154 120 140 120 L60 120 C46 120 36 112 36 96 Z" fill="#F6BE3B" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d="M36 80 C46 96 154 96 164 80" fill="none" stroke="#F89B28" strokeWidth="6" />
      <path d="M62 60 L138 60 L138 74 L62 74 Z" fill="#8A4A2F" stroke={OUT} strokeWidth="3" />
      <path d="M60 78 C84 90 116 90 140 78" fill="none" stroke="#67C158" strokeWidth="5" />
      <circle cx="74" cy="90" r="5" fill="#EF4136" stroke={OUT} strokeWidth="2" />
      <circle cx="96" cy="94" r="5" fill="#FFC800" stroke={OUT} strokeWidth="2" />
      <circle cx="120" cy="90" r="5" fill="#EF4136" stroke={OUT} strokeWidth="2" />
    </svg>
  );
}

export function IllustrationCometFries(props: { size?: number }) {
  return (
    <svg viewBox="0 0 200 160" width={props.size ?? 200} height={props.size ? (props.size * 160) / 200 : 160} aria-hidden="true">
      <ellipse cx="100" cy="146" rx="90" ry="10" fill={OUT} opacity="0.12" />
      <path d="M46 52 L150 52 L150 76 L46 76 Z" fill="#EF4136" stroke={OUT} strokeWidth="4" />
      <g fill="#F6BE3B" stroke={OUT} strokeWidth="3">
        <rect x="56" y="12" width="20" height="52" rx="6" transform="rotate(-6 66 38)" />
        <rect x="88" y="4" width="20" height="56" rx="6" transform="rotate(3 98 32)" />
        <rect x="120" y="12" width="20" height="52" rx="6" transform="rotate(-4 130 38)" />
      </g>
      <path d="M64 92 L136 92 L130 112 L70 112 Z" fill="#FFC800" stroke={OUT} strokeWidth="4" />
      <path d="M78 100 L112 100" stroke={OUT} strokeWidth="3" strokeLinecap="round" />
      <path d="M150 20 L178 4 L172 26 L196 30" fill="none" stroke="#8F57F2" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M186 8 L196 6 L192 14" fill="#8F57F2" stroke={OUT} strokeWidth="2" />
    </svg>
  );
}

export function IllustrationMoonTacos(props: { size?: number }) {
  return (
    <svg viewBox="0 0 200 150" width={props.size ?? 200} height={props.size ? (props.size * 150) / 200 : 150} aria-hidden="true">
      <ellipse cx="100" cy="136" rx="84" ry="10" fill={OUT} opacity="0.12" />
      <path d="M36 110 C36 96 48 90 64 90 L64 60 C64 42 78 30 100 30 C122 30 136 42 136 60 L136 90 C152 90 164 96 164 110 C164 116 158 118 152 118 L48 118 C42 118 36 116 36 110 Z" fill="#FFC800" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d="M64 60 C64 42 78 30 100 30" fill="none" stroke="#F89B28" strokeWidth="5" />
      <path d="M54 84 C70 96 130 96 146 84" fill="none" stroke="#8A4A2F" strokeWidth="6" strokeLinecap="round" />
      <g fill="#67C158" stroke={OUT} strokeWidth="2">
        <circle cx="84" cy="74" r="6" />
        <circle cx="100" cy="70" r="6" />
        <circle cx="116" cy="74" r="6" />
      </g>
      <g fill="#EF4136" stroke={OUT} strokeWidth="2">
        <circle cx="88" cy="84" r="4" />
        <circle cx="112" cy="84" r="4" />
      </g>
      <circle cx="100" cy="96" r="5" fill="#FFE9E5" stroke={OUT} strokeWidth="2" />
    </svg>
  );
}

export function StickerStar(props: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={props.size ?? 48} height={props.size ?? 48} aria-hidden="true">
      <path
        d="M50 4 L61 36 L95 38 L68 59 L77 92 L50 72 L23 92 L32 59 L5 38 L39 36 Z"
        fill={props.color ?? "#F6BE3B"}
        stroke={OUT}
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StickerBolt(props: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={props.size ?? 48} height={props.size ?? 48} aria-hidden="true">
      <path
        d="M58 6 L22 56 L44 56 L38 94 L80 42 L56 42 Z"
        fill={props.color ?? "#8F57F2"}
        stroke={OUT}
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StickerPlanet(props: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={props.size ?? 48} height={props.size ?? 48} aria-hidden="true">
      <ellipse cx="50" cy="50" rx="44" ry="12" fill="none" stroke="#F89B28" strokeWidth="5" transform="rotate(-18 50 50)" />
      <circle cx="50" cy="48" r="22" fill="#8F57F2" stroke={OUT} strokeWidth="4" />
      <path d="M34 42 C42 38 58 38 66 42" fill="none" stroke="#5D23C7" strokeWidth="4" />
      <circle cx="44" cy="44" r="3" fill="#F6BE3B" />
    </svg>
  );
}

export function StickerBurst(props: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={props.size ?? 48} height={props.size ?? 48} aria-hidden="true">
      <path
        d="M50 6 L58 34 L86 22 L70 44 L98 50 L70 56 L86 78 L58 66 L50 94 L42 66 L14 78 L30 56 L2 50 L30 44 L14 22 L42 34 Z"
        fill={props.color ?? "#EF4136"}
        stroke={OUT}
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StickerArrow(props: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={props.size ?? 48} height={props.size ?? 48} aria-hidden="true">
      <path d="M14 22 L86 22 L86 44 L58 44 L58 78 L42 78 L42 44 L14 44 Z" fill={props.color ?? "#F6BE3B"} stroke={OUT} strokeWidth="4" strokeLinejoin="round" transform="rotate(-8 50 50)" />
    </svg>
  );
}

export function StickerDot(props: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={props.size ?? 32} height={props.size ?? 32} aria-hidden="true">
      <circle cx="50" cy="50" r="34" fill={props.color ?? "#7432D6"} stroke={OUT} strokeWidth="4" />
    </svg>
  );
}
