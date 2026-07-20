import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FloatingIA from "@/components/FloatingIA";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Club Digital Pro — ERP Deportivo & Portal del Socio",
  description: "Plataforma integral SaaS para clubes deportivos. Carnet digital QR, pagos con Mercado Pago, transmisiones Newbery TV y gestión administrativa.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon-192.png",
    apple: "/icon-512.png",
  },
  openGraph: {
    title: "Club Digital Pro — ERP Deportivo & Portal del Socio",
    description: "Plataforma SaaS para la gestión integral e interactiva de clubes deportivos.",
    url: "https://frontend-indol-rho-38.vercel.app",
    siteName: "Club Digital Pro",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Club Digital Pro",
    description: "Gestión deportiva integral, carnet digital y portal interactivo.",
  },
};

export const viewport = {
  themeColor: "#cc0000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen flex flex-col relative`}>
        <Navbar />
        <main className="flex-grow pt-16 pb-16 md:pb-0">
          {children}
        </main>
        <FloatingIA />
      </body>
    </html>
  );
}
