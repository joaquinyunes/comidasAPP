"use client";

import { MenuPedido } from "@/components/menu-pedido";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MenuContent() {
  const searchParams = useSearchParams();
  const mesa = searchParams?.get("mesa") || "1";
  const sector = searchParams?.get("sector") || "Salón";

  // Datos de ejemplo
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
          imagenUrl: undefined,
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
          imagenUrl: undefined,
          tiempoPreparacionMin: 18,
          nivelPicante: 0,
          calorias: 920,
          alergenos: ["gluten", "lactosa"],
          disponible: true,
          destacado: false,
          tipo: "plato",
        },
        {
          id: "p3",
          nombre: "Pizza Calabresa",
          descripcion: "Longaniza, morrones, aceitunas",
          precio: 15000,
          imagenUrl: undefined,
          tiempoPreparacionMin: 20,
          nivelPicante: 1,
          calorias: 980,
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
          imagenUrl: undefined,
          tiempoPreparacionMin: 20,
          nivelPicante: 0,
          calorias: 650,
          alergenos: ["gluten", "huevo"],
          disponible: true,
          destacado: false,
          tipo: "plato",
        },
        {
          id: "pa2",
          nombre: "Tallarines a la Bolognesa",
          descripcion: "Tallarines caseros con salsa de carne",
          precio: 10500,
          imagenUrl: undefined,
          tiempoPreparacionMin: 18,
          nivelPicante: 0,
          calorias: 780,
          alergenos: ["gluten", "huevo"],
          disponible: true,
          destacado: true,
          tipo: "plato",
        },
      ],
    },
    {
      id: "cat-3",
      nombre: "Ensaladas",
      productos: [
        {
          id: "e1",
          nombre: "Ensalada Caesar",
          descripcion: "Lechuga, crutones, parmesano, dressing Caesar",
          precio: 7500,
          imagenUrl: undefined,
          tiempoPreparacionMin: 5,
          nivelPicante: 0,
          calorias: 320,
          alergenos: ["gluten", "lactosa"],
          disponible: true,
          destacado: false,
          tipo: "plato",
        },
      ],
    },
    {
      id: "cat-4",
      nombre: "Bebidas",
      productos: [
        {
          id: "b1",
          nombre: "Coca-Cola 500ml",
          descripcion: undefined,
          precio: 2500,
          imagenUrl: undefined,
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
          imagenUrl: undefined,
          nivelPicante: 0,
          calorias: 180,
          alergenos: ["gluten"],
          disponible: true,
          destacado: true,
          tipo: "bebida",
        },
        {
          id: "b3",
          nombre: "Agua Mineral",
          descripcion: "500ml sin gas",
          precio: 1800,
          imagenUrl: undefined,
          nivelPicante: 0,
          calorias: 0,
          alergenos: [],
          disponible: true,
          destacado: false,
          tipo: "bebida",
        },
      ],
    },
    {
      id: "cat-5",
      nombre: "Postres",
      productos: [
        {
          id: "d1",
          nombre: "Tiramisú",
          descripcion: "Clásico postre italiano",
          precio: 5500,
          imagenUrl: undefined,
          nivelPicante: 0,
          calorias: 450,
          alergenos: ["gluten", "lactosa", "huevo"],
          disponible: true,
          destacado: true,
          tipo: "postre",
        },
      ],
    },
  ];

  return (
    <MenuPedido categorias={categorias} mesaNumero={mesa} />
  );
}

export default function MenuPublicoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando menú...</div>}>
      <MenuContent />
    </Suspense>
  );
}
