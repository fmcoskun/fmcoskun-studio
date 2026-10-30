import { SITE } from '../data/site';

function upsert(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Canonical and absolute OG URLs require the production origin. Until
 * VITE_SITE_URL is set they are omitted rather than pointing at a guess.
 * For crawlers that do not execute JS, also hard-code these in index.html once the domain is final.
 */
export function applySeo() {
  if (!SITE.url) return;
  const canonical = `${SITE.url}/`;
  upsert('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', canonical);
  upsert(
    'meta[property="og:url"]',
    () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:url');
      return m;
    },
    'content',
    canonical,
  );
  document.head.querySelector('meta[property="og:image"]')?.setAttribute('content', `${SITE.url}/og-image.svg`);
}
