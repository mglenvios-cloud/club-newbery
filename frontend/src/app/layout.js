import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FloatingIA from "@/components/FloatingIA";
import { ThemeProvider } from "@/components/ThemeContext";
import LiveThemeEditor from "@/components/LiveThemeEditor";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@700;900&family=Montserrat:ital,wght@0,700;0,900;1,700&family=Orbitron:wght@700;900&family=Outfit:wght@700;900&family=Poppins:wght@600;800;900&family=Roboto+Condensed:wght@700;900&family=Russo+One&family=Space+Mono:wght@700&family=Teko:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col relative bg-jn-black text-white text-sm`}>
        <ThemeProvider>
          <Navbar />
          <main className="flex-grow pt-16 pb-16 md:pb-0">
            {children}
          </main>
          <FloatingIA />
          <LiveThemeEditor />
        </ThemeProvider>
      </body>
    </html>
  );
}
