import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Just Pizza — Pizza Artesanal al Carbon",
  description:
    "Pizza artesanal hecha con ingredientes frescos, masa fermentada 72 horas y horno de leña. Ciudad de Mexico.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
