// Medidas reales y contenido de cada producto sembrado. Alimenta el visor de
// cámara ("ver en tu mesa"). Los productos nuevos que no figuren acá igual
// funcionan: el visor estima tamaño por nombre y deduce lo que trae de la
// descripción.
export interface MedidasProducto {
  tamanoCm: number;
  pesoGr: number;
  incluye: string[];
}

export const MEDIDAS_PRODUCTOS: Record<string, MedidasProducto> = {
  "prod-muzzarella": { tamanoCm: 32, pesoGr: 780, incluye: ["Masa a la piedra", "Salsa de tomate", "Muzzarella", "Aceite de oliva", "8 porciones"] },
  "prod-fugazzeta": { tamanoCm: 32, pesoGr: 950, incluye: ["Doble masa", "Muzzarella", "Cebolla", "Aceite de oliva", "8 porciones"] },
  "prod-calabresa": { tamanoCm: 32, pesoGr: 840, incluye: ["Muzzarella", "Longaniza calabresa", "Morrón asado", "8 porciones"] },
  "prod-napolitana": { tamanoCm: 32, pesoGr: 820, incluye: ["Muzzarella", "Tomate fresco", "Ajo", "Perejil", "8 porciones"] },
  "prod-4quesos": { tamanoCm: 32, pesoGr: 860, incluye: ["Muzzarella", "Provolone", "Roquefort", "Parmesano", "8 porciones"] },
  "prod-empanada-carne": { tamanoCm: 13, pesoGr: 110, incluye: ["Carne cortada a cuchillo", "Cebolla", "Huevo", "Al horno"] },
  "prod-empanada-jamon": { tamanoCm: 13, pesoGr: 100, incluye: ["Jamón cocido", "Muzzarella", "Al horno"] },
  "prod-empanada-cebolla": { tamanoCm: 13, pesoGr: 95, incluye: ["Cebolla salteada", "Queso cremoso", "Al horno"] },
  "prod-noquis": { tamanoCm: 24, pesoGr: 400, incluye: ["Ñoquis de papa", "Salsa a elección: bolognesa, fileto o crema"] },
  "prod-ravioles": { tamanoCm: 24, pesoGr: 380, incluye: ["Ravioles de ricota y nuez", "Salsa a elección"] },
  "prod-helado": { tamanoCm: 11, pesoGr: 210, incluye: ["3 bochas", "Sabores del día", "Cucurucho o vasito"] },
  "prod-flan": { tamanoCm: 10, pesoGr: 180, incluye: ["Flan de huevo", "Dulce de leche", "Crema"] },
  "prod-coca": { tamanoCm: 21, pesoGr: 500, incluye: ["Botella individual 500 ml"] },
  "prod-agua": { tamanoCm: 21, pesoGr: 500, incluye: ["Botella 500 ml", "Con o sin gas"] },
  "prod-limonada": { tamanoCm: 18, pesoGr: 450, incluye: ["Limón exprimido", "Menta", "Jengibre"] },
  "prod-ipa": { tamanoCm: 17, pesoGr: 500, incluye: ["Pinta 500 ml", "Lúpulo americano"] },
  "prod-lager": { tamanoCm: 17, pesoGr: 500, incluye: ["Pinta 500 ml", "Rubia suave"] },
};
