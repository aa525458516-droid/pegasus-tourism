/**
 * PEGASUS Tourism Site Configuration
 * 
 * Note on SITE_URL:
 * Leave empty until a real domain is purchased and configured.
 * When a domain is configured (e.g. "https://my-real-domain.com"),
 * canonical tags, absolute og:url, and sitemap references will activate.
 */
export const SITE_URL: string = "";

export function getCanonicalUrl(path: string = ""): string | null {
  if (!SITE_URL) return null;
  const cleanBase = SITE_URL.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return cleanPath ? `${cleanBase}/${cleanPath}` : cleanBase;
}

export function isDomainConfigured(): boolean {
  return Boolean(SITE_URL && SITE_URL.trim().length > 0);
}
