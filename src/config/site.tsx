// ============================================================
// CONFIGURACIÓN DE LA LANDING DE LA PIZZERÍA
// Todo lo editable vive acá: textos, marca, colores,
// sabores del hero, navegación y redes.
// Nada hardcodeado en los componentes.
// ============================================================
import type { ReactNode } from "react";

export const SITE = {
  // Marca / identidad
  brand: "JUST PIZZA",
  businessName: "Pizzería La Nonna",
  tagline: "I'M TEMPTED BY",
  city: "CABA",

  // Slug del tenant en la BD (de dónde se traen carta/mesas/promos)
  tenantSlug: "pizzaria-demo",

  // Colores (acento neón sobre fondo oscuro)
  colors: {
    bg: "#141212",
    surface: "#1c1a1a",
    cream: "#f4ecd8",
    accent: "#ff3b6b",
    accentSoft: "#ff2a5a",
    gold: "#ffd23f",
    leaf: "#3f8a4d",
  },

  // Horario de atención (se muestra en el botón CTA)
  horario: "Abierto hasta las 00:00",

  // Texto de ayuda del hero
  heroHint: "Toca la pizza para cambiar de sabor",

  //contacto (editá con los datos reales del local)
  contacto: {
    direccion: "Av. Corrientes 1234, CABA",
    telefono: "+54 11 1234-5678",
    email: "hola@pizzerialanonna.com",
    // Horarios de atención por día
    horarios: [
      { dia: "Lun - Jue", hora: "12:00 - 00:00" },
      { dia: "Vie - Sáb", hora: "12:00 - 02:00" },
      { dia: "Domingo", hora: "18:00 - 00:00" },
    ],
  },

  // Redes sociales (footer)
  social: [
    { label: "Instagram", icon: "📷", href: "#" },
    { label: "Facebook", icon: "📘", href: "#" },
    { label: "WhatsApp", icon: "💬", href: "#" },
    { label: "Maps", icon: "📍", href: "#" },
  ] as { label: string; icon: string; href: string }[],
} as const;

// Navegación principal (anclas a secciones)
export const NAV_LINKS = [
  { label: "Carta", href: "#carta" },
  { label: "Mesas", href: "#mesas" },
  { label: "Promos", href: "#promos" },
  { label: "Reseñas", href: "#reseñas" },
  { label: "Reservas", href: "#reservas" },
] as const;

// Sabores del carrusel hero (SVG dibujado, sin fotos).
// Para usar fotos reales: agregá `imagenUrl` y cambiá <Slice> por <img>.
export interface Sabor {
  name: string;
  caption: string;
  crust: string;
  price?: number;
  imagenUrl?: string;
  toppings: React.ReactNode;
}

export const SABORES: Sabor[] = [
  {
    name: "MUZZARELLA",
    caption: "Classic vibes, straight-up flavor.",
    crust: "#e7b65f",
    toppings: (
      <>
        <circle cx="75" cy="95" r="14" fill="#e2493a" />
        <circle cx="120" cy="130" r="12" fill="#e2493a" />
        <circle cx="95" cy="170" r="13" fill="#e2493a" />
        <ellipse cx="70" cy="150" rx="10" ry="7" fill="#3f8a4d" />
        <ellipse cx="130" cy="90" rx="9" ry="6" fill="#3f8a4d" />
        <ellipse cx="105" cy="205" rx="9" ry="6" fill="#3f8a4d" />
      </>
    ),
  },
  {
    name: "FUGAZZETA",
    caption: "Onion-forward, low-key fire.",
    crust: "#e7b65f",
    toppings: (
      <>
        <ellipse cx="85" cy="110" rx="26" ry="20" fill="#fff8ec" />
        <ellipse cx="130" cy="160" rx="22" ry="18" fill="#fff8ec" />
        <ellipse cx="95" cy="205" rx="18" ry="14" fill="#fff8ec" />
        <ellipse cx="70" cy="160" rx="8" ry="6" fill="#3f8a4d" />
        <ellipse cx="140" cy="110" rx="8" ry="6" fill="#3f8a4d" />
      </>
    ),
  },
  {
    name: "CALABRESA",
    caption: "Spicy, loud, and always a hit.",
    crust: "#e7b65f",
    toppings: (
      <>
        <circle cx="80" cy="90" r="16" fill="#c62b2b" />
        <circle cx="125" cy="115" r="16" fill="#c62b2b" />
        <circle cx="90" cy="150" r="16" fill="#c62b2b" />
        <circle cx="130" cy="180" r="15" fill="#c62b2b" />
        <circle cx="80" cy="90" r="4" fill="#8f1d1d" />
        <circle cx="125" cy="115" r="4" fill="#8f1d1d" />
        <circle cx="90" cy="150" r="4" fill="#8f1d1d" />
        <circle cx="130" cy="180" r="4" fill="#8f1d1d" />
      </>
    ),
  },
  {
    name: "NAPOLITANA",
    caption: "Herby, bold, and full of attitude.",
    crust: "#e0a94f",
    toppings: (
      <>
        <path d="M35 60 Q100 40 165 60 L165 90 Q100 75 35 90 Z" fill="#4e7a2f" />
        <path d="M40 110 Q100 95 160 110 L160 140 Q100 128 40 140 Z" fill="#5a8b36" />
        <path d="M50 160 Q100 150 150 160 L150 190 Q100 182 50 190 Z" fill="#4e7a2f" />
        <circle cx="70" cy="100" r="7" fill="#e2c86b" />
        <circle cx="130" cy="150" r="7" fill="#e2c86b" />
      </>
    ),
  },
  {
    name: "4 QUESOS",
    caption: "Creamy, fresh, and crazy addictive.",
    crust: "#e7b65f",
    toppings: (
      <>
        <ellipse cx="85" cy="110" rx="22" ry="17" fill="#fff8ec" />
        <ellipse cx="130" cy="160" rx="19" ry="15" fill="#f6e3b0" />
        <ellipse cx="95" cy="205" rx="16" ry="12" fill="#fff8ec" />
        <ellipse cx="70" cy="160" rx="8" ry="6" fill="#3f8a4d" />
        <ellipse cx="140" cy="110" rx="8" ry="6" fill="#3f8a4d" />
      </>
    ),
  },
];

// Textos de cada sección (editables)
export const SECTION_COPY = {
  carta: { title: "NUESTRA", titleAccent: "CARTA", subtitle: "Armá tu pedido desde tu mesa 🛎️" },
  mesas: { title: "MESAS", titleAccent: "EN VIVO", subtitle: "Estado de la sala en tiempo real" },
  promos: { title: "PROMOS", titleAccent: "DE LA SEMANA", subtitle: "Aprovechá estas ofertas 🔥" },
  reseñas: { title: "LO QUE DICEN", titleAccent: "DE NOSOTROS", subtitle: "💬 Opiniones de quienes ya probaron" },
  reservas: { title: "RESERVÁ", titleAccent: "TU MESA", subtitle: "Te esperamos 🍕" },
  reservasOk: "¡Reserva recibida! Te confirmamos por teléfono.",
  reservasErr: "No pudimos enviar la reserva. Intentá de nuevo.",
} as const;

// Filtros de la carta
export const CARTA_FILTROS = [
  { id: "veggie", label: "🌱 Veggie", test: (tipo: string, alergenos: string[]) => !alergenos.includes("gluten") && tipo !== "carne" },
  { id: "picante", label: "🌶️ Picante", test: (_tipo: string, _alergenos: string[], picante: number) => picante >= 1 },
] as const;
