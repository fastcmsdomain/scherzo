/**
 * Core Web Vitals / SEO / a11y helpers.
 * Visual design and UX stay unchanged — attributes and progressive loading only.
 */

/**
 * True when this image is an LCP / chrome candidate that must load eagerly.
 * @param {HTMLImageElement} img
 * @returns {boolean}
 */
const isEagerImage = (img) => {
  if (!img || !(img instanceof HTMLImageElement)) return false;
  if (img.closest('.hero')) return true;
  if (img.closest('header .nav-brand')) return true;
  return false;
};

/**
 * Ensures every <img> in root uses lazy loading (except LCP/chrome),
 * decoding=async, and preserves empty alt for decorative icons.
 * @param {ParentNode} [root=document]
 */
export const decorateImages = (root = document) => {
  if (!root?.querySelectorAll) return;

  root.querySelectorAll('img').forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;

    if (isEagerImage(img)) {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
    } else {
      img.setAttribute('loading', 'lazy');
      img.removeAttribute('fetchpriority');
    }

    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }

    // Decorative icons: empty alt + aria-hidden (no visual change)
    if (img.closest('span.icon') && !img.getAttribute('alt')) {
      img.setAttribute('alt', '');
      img.setAttribute('aria-hidden', 'true');
    }

    // CLS: derive width from EDS ?width= query when attributes are missing
    if (!img.hasAttribute('width')) {
      try {
        const src = img.currentSrc || img.getAttribute('src') || '';
        const widthParam = new URL(src, window.location.href).searchParams.get('width');
        if (widthParam && Number(widthParam) > 0) {
          img.setAttribute('width', widthParam);
        }
      } catch {
        // ignore invalid URLs
      }
    }
  });
};

/**
 * Adds a visually-hidden skip link for keyboard / screen-reader users.
 * Does not change the default visual layout.
 */
export const ensureSkipLink = () => {
  if (document.getElementById('skip-to-main')) return;

  const main = document.querySelector('main');
  if (!main) return;

  if (!main.id) main.id = 'main';

  const skip = document.createElement('a');
  skip.id = 'skip-to-main';
  skip.className = 'skip-link';
  skip.href = `#${main.id}`;
  skip.textContent = 'Przejdź do treści';

  document.body.prepend(skip);
};

/**
 * Sets document language from metadata or defaults to Polish (site content).
 * jsonHandler may refine this later from siteConfig.
 */
export const ensureDocumentLanguage = () => {
  const metaLang = document.querySelector(
    'meta[name="lang"], meta[name="language"], meta[http-equiv="content-language"]',
  );
  const fromMeta = metaLang?.getAttribute('content')?.trim();
  const lang = fromMeta || document.documentElement.lang || 'pl';
  // Prefer pl for this Polish school site when boilerplate left "en"
  const normalized = (!fromMeta && lang.toLowerCase().startsWith('en')) ? 'pl' : lang;
  document.documentElement.lang = normalized;
};

/**
 * Marks header/footer/main landmarks if missing (a11y, no visual change).
 */
export const ensureLandmarks = () => {
  const header = document.querySelector('body > header');
  if (header && !header.getAttribute('role')) {
    header.setAttribute('role', 'banner');
  }
  const footer = document.querySelector('body > footer');
  if (footer && !footer.getAttribute('role')) {
    footer.setAttribute('role', 'contentinfo');
  }
  const main = document.querySelector('body > main');
  if (main && !main.getAttribute('role')) {
    main.setAttribute('role', 'main');
  }
};

/**
 * External links opened in a new tab get rel="noopener noreferrer"
 * (best practice / security; no UX change beyond safer tabs).
 * @param {ParentNode} [root=document]
 */
export const hardenExternalLinks = (root = document) => {
  if (!root?.querySelectorAll) return;
  const { origin } = window.location;

  root.querySelectorAll('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }
    let url;
    try {
      url = new URL(href, origin);
    } catch {
      return;
    }
    if (url.origin !== origin && anchor.target === '_blank') {
      const rel = new Set((anchor.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      rel.add('noreferrer');
      anchor.setAttribute('rel', [...rel].join(' '));
    }
  });
};

/**
 * Runs page-level a11y / SEO / performance decorations once DOM is ready.
 */
export const enhanceDocument = () => {
  ensureDocumentLanguage();
  ensureLandmarks();
  ensureSkipLink();
  decorateImages(document);
  hardenExternalLinks(document);
};
