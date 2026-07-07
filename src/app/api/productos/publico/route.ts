import { NextResponse } from "next/server";

// ============================================
// GET /api/productos/publico?tenant=slug
// ============================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get("tenant");

  // TODO: Buscar tenant por slug y retornar menú
  // Por ahora, datos de ejemplo
  const categorias = [
    {
      id: "cat-1",
      nombre: "Pizzas",
      productos: [
        {
          id: "p1",
          nombre: "Pizza Napolitana",
          descripcion: "Salsa de tomate, mozzarella, albahaca fresca",
          precio: 12500,
          imagenUrl: null,
          tiempoPreparacionMin: 15,
          nivelPicante: 0,
          calorias: 850,
          alergenos: ["gluten", "lactosa"],
          disponible: true,
          destacado: true,
          tipo: "plato",
        },
        {
          id: "p2",
          nombre: "Pizza Fugazzeta",
          descripcion: "Cebolla, mozzarella, orégano",
          precio: 14000,
          imagenUrl: null,
          tiempoPreparacionMin: 18,
          nivelPicante: 0,
          calorias: 920,
          alergenos: ["gluten", "lactosa"],
          disponible: true,
          destacado: false,
          tipo: "plato",
        },
      ],
    },
    {
      id: "cat-2",
      nombre: "Pastas",
      productos: [
        {
          id: "pa1",
          nombre: "Ñoquis Caseros",
          descripcion: "Ñoquis hechos a mano con salsa fileto",
          precio: 9800,
          imagenUrl: null,
          tiempoPreparacionMin: 20,
          nivelPicante: 0,
          calorias: 650,
          alergenos: ["gluten", "huevo"],
          disponible: true,
          destacado: false,
          tipo: "plato",
        },
      ],
    },
    {
      id: "cat-3",
      nombre: "Bebidas",
      productos: [
        {
          id: "b1",
          nombre: "Coca-Cola 500ml",
          descripcion: null,
          precio: 2500,
          imagenUrl: null,
          nivelPicante: 0,
          calorias: 210,
          alergenos: [],
          disponible: true,
          destacado: false,
          tipo: "bebida",
        },
        {
          id: "b2",
          nombre: "Cerveza Artesanal IPA",
          descripcion: "500ml",
          precio: 4500,
          imagenUrl: null,
          nivelPicante: 0,
          calorias: 180,
          alergenos: ["gluten"],
          disponible: true,
          destacado: true,
          tipo: "bebida",
        },
      ],
    },
  ];

  return NextResponse.json(categorias);
}
