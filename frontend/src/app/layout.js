import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FloatingIA from "@/components/FloatingIA";

const inter = Inter({ subsets: ["latin"] });

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Club Digital Pro";

export const metadata = {
  title: `${appName} — ERP Deportivo & Portal del Socio`,
  description: "Plataforma SaaS Multi-Club para la gestión integral de instituciones deportivas.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon-192.png",
    apple: "/icon-512.png",
  },
  openGraph: {
    title: `${appName} — ERP Deportivo & Portal del Socio`,
    description: "Plataforma SaaS para la gestión integral e interactiva de clubes deportivos.",
    siteName: appName,
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
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
