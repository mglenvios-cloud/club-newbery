import '../styles/globals.css';
import { ClubProvider } from './providers';

export const metadata = {
  title: 'Club Digital Pro - Plataforma Deportiva SaaS',
  description: 'Administración SaaS multi-club dinámica y escalable.',
};

import { ThemeProvider } from '@/components/ThemeContext';
import LiveThemeEditor from '@/components/LiveThemeEditor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>
          <ClubProvider>
            {children}
          </ClubProvider>
          <LiveThemeEditor />
        </ThemeProvider>
      </body>
    </html>
  );
}
