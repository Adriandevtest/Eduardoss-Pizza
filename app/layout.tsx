import type { Metadata } from "next";
import { Inter } from "next/font/google"; // O la fuente que estés usando
import "./globals.css";

// 1. Importas el Navbar
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pizzería Eduardo's",
  description: "La mejor pizza de Tabasco",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        
        {/* 2. Colocas el Navbar justo arriba del children */}
        <Navbar />
        
        {/* Aquí es donde Next.js carga tus páginas (admin, cocina, menu, etc) */}
        {children}
        
      </body>
    </html>
  );
}