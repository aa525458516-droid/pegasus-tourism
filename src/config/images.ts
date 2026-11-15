/**
 * Central Image Registry for PEGASUS Tourism
 * 
 * Rules:
 * 1. REAL IMAGES ONLY. No stock images, no Unsplash URLs.
 * 2. Real photos must be placed in public/images/ with the documented filenames.
 * 3. If an image file does not exist, return null. The UI will render an elegant,
 *    brand-colored background or omit the image block entirely. Never fall back to stock.
 * 
 * Recommended local image specs:
 * - hero: /images/hero.webp (1920x1080px, WebP, <300KB)
 * - about: /images/about.webp (1200x800px, WebP, <200KB)
 * - share: /images/share.webp (1200x630px, WebP, <150KB)
 */

export interface ImageSpec {
  path: string;
  altEn: string;
  altDe: string;
  altAr: string;
  altRu: string;
  width: number;
  height: number;
}

export const SITE_IMAGES: Record<string, ImageSpec> = {
  hero: {
    path: '/images/hurghada.jpg',
    altEn: 'PEGASUS Private Transportation & Red Sea Coast in Hurghada',
    altDe: 'PEGASUS Privater Transport & Rotes Meer in Hurghada',
    altAr: 'بيجاسوس للنقل الخاص وساحل البحر الأحمر بالغردقة',
    altRu: 'PEGASUS частные трансферы и побережье Красного моря в Хургаде',
    width: 1920,
    height: 1080,
  },
  about: {
    path: '/images/orange_bay.jpg',
    altEn: 'PEGASUS Chauffeur Service & Orange Bay Excursions in Hurghada',
    altDe: 'PEGASUS Chauffeurservice & Orange Bay Ausflüge in Hurghada',
    altAr: 'خدمة التوصيل الخاص ورحلات أورانج باي بالغردقة',
    altRu: 'Услуги личного водителя PEGASUS и экскурсии на Оранж Бэй в Хургаде',
    width: 1200,
    height: 800,
  },
  share: {
    path: '/images/hurghada.jpg',
    altEn: 'PEGASUS Tourism Hurghada',
    altDe: 'PEGASUS Tourismus Hurghada',
    altAr: 'بيجاسوس للسياحة بالغردقة',
    altRu: 'PEGASUS Туризм Хургада',
    width: 1200,
    height: 630,
  },
};

/**
 * Returns the path to the image if the owner has uploaded it, or null.
 * Set to true for our high-fidelity local assets.
 */
export const HAS_REAL_IMAGES: Record<string, boolean> = {
  hero: true,
  about: true,
  share: true,
  gallery: true,
};

export function getSiteImage(key: keyof typeof SITE_IMAGES): ImageSpec | null {
  if (HAS_REAL_IMAGES[key]) {
    return SITE_IMAGES[key];
  }
  return null;
}
