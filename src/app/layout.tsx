import type { Metadata } from "next";
import { Anton, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cozizina.com"),
  title: {
    default: "Cozizina — Comida al estilo cósmico",
    template: "%s · Cozizina",
  },
  description:
    "Comida cósmica con ingredientes frescos y sabores que explotan en tu paladar. Buenos Aires.",
  openGraph: {
    title: "Cozizina — Comida al estilo cósmico",
    description:
      "Comida cósmica con ingredientes frescos y sabores que explotan en tu paladar.",
    type: "website",
    locale: "es_AR",
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${poppins.variable} ${anton.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
