import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FloatingIA from "@/components/FloatingIA";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Club Jorge Newbery - Portal Digital",
  description: "Comunidad digital del Club Social y Deportivo Jorge Newbery. Deporte, educación, entretenimiento e inteligencia artificial.",
  manifest: "/manifest.json",
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
