import type { Metadata } from "next";
import CartaPagina from "@/components/carta/CartaPagina";

export const metadata: Metadata = {
  title: "La carta",
  description:
    "Pizzas, empanadas, pastas, postres y bebidas con sabor cósmico. Recorré la carta de Cozizina y mirá cada plato en tu mesa con la cámara.",
};

export default function MenuPage() {
  return <CartaPagina />;
}
