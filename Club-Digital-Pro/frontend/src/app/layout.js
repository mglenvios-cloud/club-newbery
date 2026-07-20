import '../styles/globals.css';
import { ClubProvider } from './providers';

export const metadata = {
  title: 'Club Digital Pro - Plataforma Deportiva SaaS',
  description: 'Administración SaaS multi-club dinámica y escalable.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ClubProvider>
          {children}
        </ClubProvider>
      </body>
    </html>
  );
}
