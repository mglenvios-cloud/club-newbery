// Shared Type Definitions for Club Digital Pro (Multi-Tenant SaaS)

export interface Club {
  id: string | number;
  nombre: string;
  slug: string;
  logo: string;
  escudo: string;
  banner: string;
  
  // Theme Branding Colors (Hex values, e.g. "#cc0000")
  colorPrimario: string;
  colorSecundario: string;
  colorMenu: string;
  colorBotones: string;
  colorTexto: string;
  
  // Contact & Location
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  pais: string;
  
  // Social Networks & Website
  sitioWeb: string;
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  
  // Status: ACTIVO, INACTIVO, SUSPENDIDO
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SuperAdminConfig {
  id: string;
  totalLicenses: number;
  activeLicenses: number;
  featuresEnabled: string[]; // ['SOCIOS', 'FINANZAS', 'DEPORTIVA', 'TV', 'MARKETING']
}
