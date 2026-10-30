/**
 * Constantes oficiales del frontend de Navidad David
 * Centraliza rutas de activos, umbrales de negocio y configuración general.
 * Cumple con principios DRY y Single Responsibility.
 */

export const FREE_SHIPPING_THRESHOLD_COP = 150000;

export const OFFICIAL_ASSETS = {
  // Logo corporativo oficial
  LOGO_ORIGINAL: '/Logo_david_original.png',
  LOGO_WEBP: '/Logo_david.webp',

  // Imagen principal del Hero
  HERO_FAMILY: '/img/hero_familia.png',
  HERO_FAMILY_WEBP: '/img/hero_familia.webp',

  // Colecciones fotográficas del Hero (los 3 recuadros)
  HERO_FAMILY_2: '/img/hero_familia_2.png',
  HERO_FAMILY_3: '/img/hero_familia_3.png',
  HERO_FAMILY_4: '/img/hero_familia_4.png',

  // Catálogo de árboles
  TREE_TRADITIONAL: '/img/arbol_tradicional.png',
  TREE_TRADITIONAL_WEBP: '/img/arbol_tradicional.webp',
  TREE_FIBER: '/img/arbol_fibra.png',
  TREE_FIBER_WEBP: '/img/arbol_fibra.webp',
} as const;

export const WHATSAPP_CONTACT = {
  PHONE: '573104567890',
  DISPLAY: '+57 310 456 7890',
  buildUrl: (message: string) => `https://wa.me/573104567890?text=${encodeURIComponent(message)}`,
} as const;
