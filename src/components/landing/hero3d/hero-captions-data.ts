// Los carteles del viaje. `from`/`to` son progreso de scroll (0..1) y
// coinciden con el momento en que la cámara pasa por cada producto.
export interface HeroCaption {
  id: string;
  tag: string;
  title: string;
  text: string;
  // Lado del texto: el producto 3D aparece del lado opuesto.
  side: "left" | "right";
  from: number;
  to: number;
}

export const HERO_CAPTIONS: HeroCaption[] = [
  {
    id: "pizzanaut",
    tag: "Pizzas",
    title: "Pizzanaut",
    text: "Masa artesanal, mozzarella y pepperoni. Del horno directo a órbita.",
    side: "left",
    from: 0.2,
    to: 0.37,
  },
  {
    id: "meteor-empanada",
    tag: "Empanadas",
    title: "Meteor Empanada",
    text: "Masa dorada y crocante, relleno jugoso. Caen de a docena.",
    side: "right",
    from: 0.36,
    to: 0.5,
  },
  {
    id: "comet-fries",
    tag: "Para compartir",
    title: "Comet Fries",
    text: "Papas cortadas a mano con la salsa nebulosa de la casa.",
    side: "left",
    from: 0.49,
    to: 0.62,
  },
  {
    id: "nebula-soda",
    tag: "Bebidas",
    title: "Nebula Soda",
    text: "Bien fría, con burbujas de otro mundo. La compañera de la misión.",
    side: "right",
    from: 0.62,
    to: 0.76,
  },
];

// Ventana del cartel final (queda visible hasta el fin del viaje).
export const FINALE_RANGE = { from: 0.8, to: 1 };
// El texto principal del hero se va entre estos progresos.
export const COPY_EXIT_RANGE = { from: 0.04, to: 0.15 };
