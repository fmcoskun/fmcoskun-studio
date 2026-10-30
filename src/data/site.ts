const trimSlash = (value: string) => value.replace(/\/+$/, '');

function readHttpsUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    // Plain http would leak form data in transit; only allow it for local development.
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol === 'https:' || (url.protocol === 'http:' && isLocal)) return trimSlash(url.toString());
  } catch {
    /* fall through */
  }
  if (import.meta.env.DEV) console.warn(`[config] Ignoring invalid URL: ${raw}`);
  return undefined;
}

function readEmail(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) ? raw : undefined;
}

export const SITE = {
  name: 'FMCOSKUN Studio',
  tagline: 'Streaming Your Success To New Orbits',
  message: 'We transform ambitious ideas into intelligent digital experiences that move businesses forward.',
  url: readHttpsUrl(import.meta.env.VITE_SITE_URL),
  contactEndpoint: readHttpsUrl(import.meta.env.VITE_CONTACT_ENDPOINT),
  contactEmail: readEmail(import.meta.env.VITE_CONTACT_EMAIL),
} as const;
