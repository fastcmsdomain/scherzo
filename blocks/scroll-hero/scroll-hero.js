/**
 * Scroll Hero Block - Franklin Component
 * Wellington-style parallax cover scroll: each section is pinned (fixed) while
 * the next section slides UP from the bottom to cover it. The previous section
 * stays static; outgoing text drifts up and fades for a parallax feel.
 * Built with GSAP ScrollTrigger. Optimized for performance and accessibility.
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  gsapBaseURL: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/',
  // Cover effect tuning
  cover: {
    factor: 1.6, // viewport heights of scroll per transition (longer = smoother)
    dwell: 0.12, // portion of a segment the slide rests before its text shifts
    // Two-phase split: the text shift completes FIRST, then the image cover
    // plays. textPortion is the fraction of the moving part spent on the text;
    // the image stays paused until the text has reached its final positions.
    textPortion: 0.55,
  },
  // Wellington-style text choreography. Each slide owns one scroll segment.
  // When the slide settles, the TITLE (strapline) sits low (bottom anchor) and
  // the SUBTITLE (strapline-2) waits off-screen below. As the user scrolls, the
  // title travels to the TOP and the subtitle rises from the bottom to the
  // MIDDLE. They never overlap: distinct top/middle/bottom anchors keep a gap.
  // Positions are `top` values in vh (relative to the viewport).
  text: {
    titleBottomVh: 95, // title resting anchor at the very bottom of the slide
    titleTopVh: 15, // title destination near the top of the page
    subtitleStartVh: 108, // subtitle starts just below the fold (off-screen)
    subtitleMiddleVh: 52, // subtitle destination, the middle (below the top title)
    // Slides listed here keep BOTH straplines locked dead-centre (no shift) for
    // the whole slide. Index is the slide's position (0-based). The 2nd slide
    // (index 1) is centred; its title is at the centre, subtitle just below.
    centeredSlides: [1],
    centeredTitleVh: 66, // centred slide: title block sits centred in viewport
    centeredSubtitleVh: 66, // centred slide: subtitle (empty here) tracks centre
  },
  navScrollDuration: 1,
};

const SELECTORS = {
  progressNav: '.progress-nav',
  progressNavItem: '.progress-nav li',
  screenSection: '.screen-section',
  container: '.scroll-hero-container',
  strapline: '.strapline',
  strapline2: '.strapline-2',
  backgroundImage: '.image-bg-0',
  scrollOverlay: '.scroll-overlay',
};

const CLASSES = {
  active: 'isActive',
  lastSlide: 'section-last-slide',
};

// =============================================================================
// PERFORMANCE: CACHED DOM REFERENCES
// =============================================================================

let cachedNavItems = null;
let cachedSections = null;

const clearDOMCache = () => {
  cachedNavItems = null;
  cachedSections = null;
};

const getNavItems = () => {
  if (!cachedNavItems) {
    cachedNavItems = document.querySelectorAll(SELECTORS.progressNavItem);
  }
  return cachedNavItems;
};

const getSections = () => {
  if (!cachedSections) {
    cachedSections = document.querySelectorAll(SELECTORS.screenSection);
  }
  return cachedSections;
};

// =============================================================================
// ACCESSIBILITY: REDUCED MOTION SUPPORT
// =============================================================================

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Updates progress navigation active state with ARIA
 * @param {number} activeIndex - Index of active section
 */
const updateProgressNav = (activeIndex) => {
  getNavItems().forEach((li, index) => {
    const isActive = index === activeIndex;
    li.classList.toggle(CLASSES.active, isActive);
    li.setAttribute('aria-current', isActive ? 'step' : 'false');
  });
};

/**
 * Loads an external script dynamically (skips duplicates)
 * @param {string} src - Script URL
 * @returns {Promise} - Resolves when script loads
 */
const loadScript = (src) => new Promise((resolve, reject) => {
  if (document.querySelector(`script[src="${src}"]`)) {
    resolve();
    return;
  }
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.onload = resolve;
  script.onerror = reject;
  document.head.appendChild(script);
});

/**
 * Extracts unique images from parsed HTML document
 * @param {Document} doc - Parsed HTML document
 * @returns {string[]} - Array of unique image URLs
 */
const extractImages = (doc) => {
  const images = [];
  const { origin } = window.location;

  doc.querySelectorAll('picture source[media="(min-width: 600px)"]').forEach((source) => {
    const srcset = source.getAttribute('srcset');
    if (srcset) {
      const [src] = srcset.split('?');
      images.push(new URL(src, origin).href);
    }
  });

  doc.querySelectorAll('img:not(picture img)').forEach((img) => {
    const src = img.getAttribute('src');
    if (src) {
      const [cleanSrc] = src.split('?');
      images.push(new URL(cleanSrc, origin).href);
    }
  });

  return [...new Set(images)];
};

/**
 * Extracts non-empty text content from elements
 * @param {Document} doc - Parsed HTML document
 * @param {string} selector - CSS selector
 * @returns {string[]} - Array of text content
 */
const extractTextParts = (doc, selector) => {
  const parts = [];
  doc.querySelectorAll(selector).forEach((el) => {
    const text = el.textContent.trim();
    if (text) parts.push(text);
  });
  return parts;
};

/**
 * Gets background and logo image sources for a section
 * For last-slide: [0] = logo, [1] = background. Other slides: [0] = background.
 * @param {Object} section - Section data
 * @returns {Object} - { bgImageSrc, logoImage }
 */
const getSectionImages = (section) => {
  const images = section.backgroundImages || [section.image];
  const isLastSlide = section.id === CLASSES.lastSlide;

  if (isLastSlide && images.length >= 2) {
    return { logoImage: images[0], bgImageSrc: images[1] };
  }
  return { logoImage: '', bgImageSrc: images[0] || section.image };
};

/**
 * Escapes HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
const escapeHtml = (str) => {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// =============================================================================
// GSAP LOADING
// =============================================================================

/**
 * Loads GSAP libraries if not already loaded
 * @returns {Promise<boolean>} - True if loaded successfully
 */
const loadGSAPLibraries = async () => {
  const { gsapBaseURL } = CONFIG;

  try {
    if (!window.gsap) {
      await loadScript(`${gsapBaseURL}gsap.min.js`);
    }
    if (!window.ScrollTrigger) {
      await loadScript(`${gsapBaseURL}ScrollTrigger.min.js`);
      window.gsap.registerPlugin(window.ScrollTrigger);
    }
    if (!window.ScrollToPlugin) {
      await loadScript(`${gsapBaseURL}ScrollToPlugin.min.js`);
      window.gsap.registerPlugin(window.ScrollToPlugin);
    }
    return true;
  } catch {
    return false;
  }
};

// =============================================================================
// FALLBACK SCROLL (NO GSAP / REDUCED MOTION)
// =============================================================================

/**
 * Initializes basic stacked scroll when GSAP is unavailable
 * @param {HTMLElement} block - Block element (gets no-gsap class)
 */
const initBasicScroll = (block) => {
  if (block) block.classList.add('no-gsap');

  const sections = getSections();

  getNavItems().forEach((li, index) => {
    const go = () => {
      const target = sections[index];
      if (target) {
        target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        target.focus({ preventScroll: true });
      }
    };
    li.addEventListener('click', go);
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateProgressNav(Array.from(sections).indexOf(entry.target));
        }
      });
    },
    { threshold: 0.5 },
  );
  sections.forEach((section) => observer.observe(section));
};

// =============================================================================
// SECTION CREATION
// =============================================================================

/**
 * Creates HTML for title/subtitle parts with escaped content
 * @param {string[]} parts - Array of text parts
 * @param {string} className - Base class name
 * @returns {string} - HTML string
 */
const createPartsHtml = (parts, className) => parts
  .map((part, i) => `<span class="${className} ${className}-${i}">${escapeHtml(part)}</span>`)
  .join('');

/**
 * Creates a section DOM element with accessibility attributes
 * @param {Object} section - Section data
 * @param {number} index - Section index
 * @param {number} total - Total sections
 * @returns {HTMLElement} - Section element
 */
const createSection = (section, index, total) => {
  const { bgImageSrc, logoImage } = getSectionImages(section);
  const isLastSlide = section.id === CLASSES.lastSlide;

  const mainTitleParts = section.mainTitleParts?.length
    ? section.mainTitleParts
    : [section.title];
  const subtitleParts = section.subtitleParts?.length
    ? section.subtitleParts
    : [section.subtitle];

  const bgHtml = bgImageSrc
    ? `<div class="img image-bg image-bg-0" data-bg="${escapeHtml(bgImageSrc)}" role="img" aria-label="${escapeHtml(section.title)}"></div>`
    : '';
  const logoHtml = isLastSlide && logoImage
    ? `<img class="strapline-logo" src="${escapeHtml(logoImage)}" alt="Scherzo Logo" loading="lazy" decoding="async" width="125" />`
    : '';

  const sectionDiv = document.createElement('div');
  sectionDiv.className = `screen-section ${section.id}`;
  sectionDiv.setAttribute('role', 'region');
  sectionDiv.setAttribute('aria-label', `Section ${index + 1} of ${total}: ${section.title}`);
  sectionDiv.setAttribute('tabindex', '-1');

  sectionDiv.innerHTML = `
    <div class="screen ${section.id.replace('section-', '')}">
      <div class="screen-inner">
        <div class="background" aria-hidden="true">${bgHtml}</div>
        <div class="scroll-overlay" aria-hidden="true"></div>
        <div class="fade" aria-hidden="true"></div>
        <div class="strapline">
          ${logoHtml}
          <h1 class="main-title">${createPartsHtml(mainTitleParts, 'title-part')}</h1>
        </div>
        <div class="strapline-2">
          <h2 class="subtitle">${createPartsHtml(subtitleParts, 'subtitle-part')}</h2>
        </div>
      </div>
    </div>
  `;

  return sectionDiv;
};

// =============================================================================
// PARALLAX COVER ANIMATIONS (Wellington-style)
// =============================================================================

/**
 * Sets all section background images
 * @param {Object[]} sections - Section data array
 */
const setBackgrounds = (sections) => {
  const elements = getSections();
  sections.forEach((section, index) => {
    const bgElement = elements[index]?.querySelector(SELECTORS.backgroundImage);
    if (bgElement) {
      const { bgImageSrc } = getSectionImages(section);
      if (bgImageSrc) {
        bgElement.style.backgroundImage = `url(${bgImageSrc})`;
        bgElement.style.display = 'block';
      }
    }
  });
};

/**
 * Builds the pinned cover-reveal timeline (Wellington College choreography).
 *
 * Each slide owns one scroll segment. When the slide settles, its TITLE
 * (.strapline) sits low (bottom anchor) and its SUBTITLE (.strapline-2) waits
 * off-screen below. As the user scrolls through the segment:
 *   - the title travels from the bottom up to the TOP of the page;
 *   - the subtitle rises from the bottom to the MIDDLE of the page;
 *   - the next slide's image slides up to cover, lagging slightly behind the
 *     text so the picture trails the words.
 * Distinct top/middle/bottom anchors guarantee the lines never overlap.
 * Everything is scrubbed, so scroll-up plays the exact reverse.
 * @param {Object} gsap - GSAP instance
 */
const initParallaxCover = (gsap) => {
  const sections = getSections();
  const container = document.querySelector(SELECTORS.container);
  const total = sections.length;
  const { factor, dwell, textPortion } = CONFIG.cover;
  const {
    titleBottomVh,
    titleTopVh,
    subtitleStartVh,
    subtitleMiddleVh,
    centeredSlides,
    centeredTitleVh,
    centeredSubtitleVh,
  } = CONFIG.text;

  const isCentered = (index) => centeredSlides.includes(index);

  // Total scroll distance: one segment per transition + a final resting screen
  if (container) {
    container.style.height = `${((total - 1) * factor + 1) * 100}vh`;
  }

  // Scroll distance (px) of a single transition; recomputed on refresh
  const segment = () => window.innerHeight * factor;

  // Place a strapline at a given viewport anchor (top in vh, centred on itself)
  const setAt = (el, vh, opacity = 1) => {
    if (el) gsap.set(el, { top: `${vh}vh`, yPercent: -50, opacity });
  };

  // Initialize base states: each slide's title rests low, subtitle off-screen.
  sections.forEach((section, i) => {
    const title = section.querySelector(SELECTORS.strapline);
    const subtitle = section.querySelector(SELECTORS.strapline2);
    const overlay = section.querySelector(SELECTORS.scrollOverlay);

    if (isCentered(i)) {
      // Centred slide: both straplines locked dead-centre, fully visible.
      setAt(title, centeredTitleVh, 1);
      setAt(subtitle, centeredSubtitleVh, 1);
    } else {
      setAt(title, titleBottomVh, 1);
      // Subtitle waits below the fold until its segment begins
      setAt(subtitle, subtitleStartVh, 0);
    }
    // Overlay: centred slides keep it fully on (constant 0.5 veil); others
    // start transparent and the overlay fades in as the text shifts.
    if (overlay) gsap.set(overlay, { opacity: isCentered(i) ? 1 : 0 });

    // First section visible; the rest wait below the fold
    gsap.set(section, { yPercent: i === 0 ? 0 : 100 });
  });

  updateProgressNav(0);

  // One timeline per transition, split into two sequential phases:
  //   Phase 1 [0 .. textPortion]      shift slide[t-1]'s text into place
  //   Phase 2 [textPortion .. 1]      slide[t]'s image rises to cover it
  // The image stays PAUSED through phase 1, so it only starts moving once the
  // title is at the top and the subtitle is in the middle. Eased tweens keep
  // both phases buttery-smooth (Wellington glide).
  const imagePortion = 1 - textPortion;

  for (let t = 1; t < total; t += 1) {
    const covering = sections[t];
    const active = sections[t - 1];

    const activeTitle = active.querySelector(SELECTORS.strapline);
    const activeSubtitle = active.querySelector(SELECTORS.strapline2);
    const activeOverlay = active.querySelector(SELECTORS.scrollOverlay);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: () => (t - 1) * segment() + segment() * dwell,
        end: () => t * segment(),
        scrub: 1, // small smoothing so scrubbing glides instead of snapping
        invalidateOnRefresh: true,
        onEnter: () => updateProgressNav(t),
        onEnterBack: () => updateProgressNav(t),
        onLeaveBack: () => updateProgressNav(t - 1),
      },
    });

    // --- Phase 1: text settles (image untouched) ---
    // Centred slides keep their text locked in the centre (no shift); only the
    // overlay and the image cover play during their segment.
    if (!isCentered(t - 1)) {
      // Title rises from the bottom anchor to the top of the page.
      if (activeTitle) {
        tl.fromTo(
          activeTitle,
          { top: `${titleBottomVh}vh` },
          { top: `${titleTopVh}vh`, ease: 'power1.inOut', duration: textPortion },
          0,
        );
      }

      // Subtitle rises from below the fold to the middle, fading in. It stops at
      // the middle, so the two lines never meet.
      if (activeSubtitle) {
        tl.fromTo(
          activeSubtitle,
          { top: `${subtitleStartVh}vh`, opacity: 0 },
          {
            top: `${subtitleMiddleVh}vh`,
            opacity: 1,
            ease: 'power1.inOut',
            duration: textPortion,
          },
          0,
        );
      }
    }

    // Dark overlay fades in over the image as the text shifts, reaching full
    // strength (CSS rgba alpha 0.5) exactly when the title is at the top.
    // Centred slides skip this: their overlay stays at a constant 0.5 veil.
    if (activeOverlay && !isCentered(t - 1)) {
      tl.fromTo(
        activeOverlay,
        { opacity: 0 },
        { opacity: 1, ease: 'power1.inOut', duration: textPortion },
        0,
      );
    }

    // --- Phase 2: image cover (starts only after the text is in place) ---
    tl.fromTo(
      covering,
      { yPercent: 100 },
      { yPercent: 0, ease: 'power2.inOut', duration: imagePortion },
      textPortion,
    );
  }
};

/**
 * Wires progress-nav clicks/keys to scroll to a section's resting position
 * @param {Object} gsap - GSAP instance
 */
const initNavControls = (gsap) => {
  const { factor } = CONFIG.cover;
  const segment = () => window.innerHeight * factor;

  getNavItems().forEach((li, index) => {
    const go = () => {
      const targetY = index === 0 ? 0 : index * segment();
      gsap.to(window, {
        duration: CONFIG.navScrollDuration,
        scrollTo: { y: targetY, autoKill: false },
        ease: 'power2.inOut',
      });
      const target = getSections()[index];
      if (target) target.focus({ preventScroll: true });
    };

    li.addEventListener('click', go);
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });
};

/**
 * Initializes scroll animations with GSAP
 */
const initScrollAnimations = () => {
  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger) {
    initBasicScroll();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  initParallaxCover(gsap);
  initNavControls(gsap);

  // Keep distances correct on resize/orientation change
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });
};

// =============================================================================
// DATA FETCHING
// =============================================================================

/**
 * Fetches and processes a single slide's data
 * @param {Object} item - Slide index item
 * @returns {Promise<Object|null>} - Processed section data or null
 */
const fetchSlideData = async (item) => {
  if (!item.path?.startsWith('/slides/')) {
    return null;
  }

  try {
    const response = await fetch(`${item.path}.plain.html`);
    if (!response.ok) return null;

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const textParts = extractTextParts(doc, '.tytul-zdjecia > div > div');
    const backgroundImages = extractImages(doc);

    const firstSource = doc.querySelector('picture source[media="(min-width: 600px)"]');
    const fallbackImage = firstSource
      ? new URL(firstSource.getAttribute('srcset').split('?')[0], window.location.origin).href
      : '';

    return {
      ...item,
      id: `section-${item.path.split('/').pop()}`,
      mainTitleParts: textParts.slice(0, 2),
      subtitleParts: textParts.slice(2, 4),
      title: textParts[0] || item.title,
      subtitle: textParts.slice(2, 4).join(' '),
      backgroundImages: backgroundImages.length > 0 ? backgroundImages : [fallbackImage],
      image: fallbackImage,
    };
  } catch {
    return null;
  }
};

/**
 * Fetches all scroll hero section data
 * @returns {Promise<Object[]>} - Array of section data
 */
const fetchScrollHeroData = async () => {
  try {
    const response = await fetch('/slides/query-index.json');
    if (!response.ok) return [];

    const { data } = await response.json();
    if (!Array.isArray(data)) return [];

    const sections = await Promise.all(data.map(fetchSlideData));
    return sections.filter(Boolean);
  } catch {
    return [];
  }
};

// =============================================================================
// MAIN DECORATOR
// =============================================================================

/**
 * Creates progress navigation with accessibility
 * @param {Object[]} sections - Section data array
 * @returns {HTMLElement} - Navigation element
 */
const createProgressNav = (sections) => {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Section navigation');

  const ul = document.createElement('ul');
  ul.className = 'progress-nav';
  ul.setAttribute('role', 'list');

  sections.forEach((section, index) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'listitem');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-current', index === 0 ? 'step' : 'false');
    li.setAttribute('aria-label', `Go to section: ${section.title}`);
    li.innerHTML = `<span>${escapeHtml(section.title)}</span>`;
    if (index === 0) li.classList.add(CLASSES.active);
    ul.appendChild(li);
  });

  nav.appendChild(ul);
  return nav;
};

/**
 * Main block decorator
 * @param {HTMLElement} block - Block element to decorate
 */
export default async function decorate(block) {
  clearDOMCache();

  const sections = await fetchScrollHeroData();

  if (!sections.length) {
    block.innerHTML = '<p role="alert">No scroll hero sections found.</p>';
    return;
  }

  const container = document.createElement('div');
  container.className = 'scroll-hero-container';
  container.setAttribute('role', 'main');

  const total = sections.length;
  sections.forEach((section, index) => {
    container.appendChild(createSection(section, index, total));
  });

  block.innerHTML = '';
  block.appendChild(createProgressNav(sections));
  block.appendChild(container);

  // Always set background images (works for both GSAP and fallback paths)
  setBackgrounds(sections);

  // Initialize after paint so layout/measurements are stable
  requestAnimationFrame(async () => {
    const gsapLoaded = await loadGSAPLibraries();
    if (gsapLoaded && window.gsap && window.ScrollTrigger) {
      initScrollAnimations();
    } else {
      initBasicScroll(block);
    }
  });
}
