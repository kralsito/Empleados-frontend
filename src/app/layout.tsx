import type { Metadata } from "next";
import { Russo_One } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

const russoOne = Russo_One({
  variable: "--font-russo-one",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "TecnoKral | Gestión de Empleados",
  description: "Panel de administración y configuración de roles para Gestión de Empleados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${russoOne.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
