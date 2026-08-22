// ============================================================
// CONFIGURACIÓN DE MARCA — COZIZINA
// Textos y datos editables del sitio público.
// ============================================================

export const SITE = {
  brand: "COZIZINA",
  businessName: "Cozizina",
  tagline: "Comida al estilo cósmico",
  city: "Buenos Aires",

  // Slug del tenant en la base de datos (API pública).
  tenantSlug: "pizzaria-demo",

  horario: "Abierto hasta las 00:00",

  contacto: {
    direccion: "Av. Corrientes 1234, CABA",
    telefono: "+54 11 5555 1234",
    email: "hola@cozizina.com",
    horarios: [
      { dia: "Lun a Jue", hora: "12:00 – 00:00" },
      { dia: "Vie y Sáb", hora: "12:00 – 02:00" },
      { dia: "Domingo", hora: "18:00 – 00:00" },
    ],
  },

  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Facebook", href: "https://facebook.com" },
    { label: "WhatsApp", href: "https://wa.me/541155551234" },
  ],
} as const;
