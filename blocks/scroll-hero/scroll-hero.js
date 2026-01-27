/**
 * Scroll Hero Block - Franklin Component
 * Parallax cover scroll animation with GSAP ScrollTrigger
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  gsapBaseURL: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/',
  scrollPerSection: 1.5, // viewport heights per section
  animationPhases: {
    reveal: 0.4, // 40% of scroll for section reveal
    straplineStart: 0.2,
    straplineEnd: 0.7,
    subtitleStart: 0.35,
  },
  initialPositions: {
    firstSection: { straplineTop: '18%', subtitleTop: '50%' },
    otherSections: { straplineTop: '85%', subtitleTop: '105%' },
    finalPositions: { straplineTop: '15%', subtitleTop: '50%' },
  },
};

const SELECTORS = {
  progressNav: '.progress-nav',
  progressNavItem: '.progress-nav li',
  screenSection: '.screen-section',
  container: '.scroll-hero-container',
  strapline: '.strapline',
  strapline2: '.strapline-2',
  backgroundImage: '.image-bg-0',
};

const CLASSES = {
  active: 'isActive',
  lastSlide: 'section-last-slide',
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Updates progress navigation active state
 * @param {number} activeIndex - Index of active section
 */
const updateProgressNav = (activeIndex) => {
  const navItems = document.querySelectorAll(SELECTORS.progressNavItem);
  navItems.forEach((li, index) => {
    li.classList.toggle(CLASSES.active, index === activeIndex);
  });
};

/**
 * Loads an external script dynamically
 * @param {string} src - Script URL
 * @returns {Promise} - Resolves when script loads
 */
const loadScript = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = src;
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

  // Extract from picture sources (desktop images)
  doc.querySelectorAll('picture source[media="(min-width: 600px)"]').forEach((source) => {
    const srcset = source.getAttribute('srcset');
    if (srcset) {
      const [src] = srcset.split('?');
      images.push(new URL(src, window.location.origin).href);
    }
  });

  // Extract standalone img elements (not in picture)
  doc.querySelectorAll('img').forEach((img) => {
    if (!img.closest('picture')) {
      const src = img.getAttribute('src');
      if (src) {
        const [cleanSrc] = src.split('?');
        images.push(new URL(cleanSrc, window.location.origin).href);
      }
    }
  });

  // Remove duplicates, preserve order
  return [...new Set(images)];
};

/**
 * Extracts text content from elements
 * @param {Document} doc - Parsed HTML document
 * @param {string} selector - CSS selector
 * @returns {string[]} - Array of text content
 */
const extractTextParts = (doc, selector) => Array.from(doc.querySelectorAll(selector))
  .map((el) => el.textContent.trim())
  .filter(Boolean);

/**
 * Gets background and logo image sources for a section
 * @param {Object} section - Section data
 * @returns {Object} - { bgImageSrc, logoImage }
 */
const getSectionImages = (section) => {
  const images = section.backgroundImages || [section.image];
  const isLastSlide = section.id === CLASSES.lastSlide;

  // Last slide: [0] = logo, [1] = background
  // Other slides: [0] = background
  if (isLastSlide && images.length >= 2) {
    return { logoImage: images[0], bgImageSrc: images[1] };
  }
  return { logoImage: '', bgImageSrc: images[0] || section.image };
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
// FALLBACK SCROLL (NO GSAP)
// =============================================================================

/**
 * Initializes basic scroll behavior when GSAP is unavailable
 */
const initBasicScroll = () => {
  const sections = document.querySelectorAll(SELECTORS.screenSection);

  // Click navigation
  document.querySelectorAll(SELECTORS.progressNavItem).forEach((li, index) => {
    li.addEventListener('click', () => {
      const target = sections[index]?.querySelector('.screen');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Intersection observer for progress updates
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Array.from(sections).indexOf(entry.target);
          updateProgressNav(index);
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
 * Creates HTML for title/subtitle parts
 * @param {string[]} parts - Array of text parts
 * @param {string} className - Base class name
 * @returns {string} - HTML string
 */
const createPartsHtml = (parts, className) => parts
  .map((part, i) => `<span class="${className} ${className}-${i}">${part}</span>`)
  .join('');

/**
 * Creates a section DOM element
 * @param {Object} section - Section data
 * @returns {HTMLElement} - Section element
 */
const createSection = (section) => {
  const { bgImageSrc, logoImage } = getSectionImages(section);
  const isLastSlide = section.id === CLASSES.lastSlide;

  // Prepare content
  const mainTitleParts = section.mainTitleParts?.length
    ? section.mainTitleParts
    : [section.title];
  const subtitleParts = section.subtitleParts?.length
    ? section.subtitleParts
    : [section.subtitle];

  const bgHtml = bgImageSrc
    ? `<div class="img image-bg image-bg-0" data-bg="${bgImageSrc}"></div>`
    : '';
  const logoHtml = isLastSlide && logoImage
    ? `<img class="strapline-logo" src="${logoImage}" alt="Logo" />`
    : '';

  // Create element
  const sectionDiv = document.createElement('div');
  sectionDiv.className = `screen-section ${section.id}`;
  sectionDiv.innerHTML = `
    <div class="screen ${section.id.replace('section-', '')}">
      <div class="screen-inner">
        <div class="background">${bgHtml}</div>
        <div class="fade"></div>
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
// PARALLAX ANIMATIONS
// =============================================================================

/**
 * Sets up scroll trigger for a single section
 * @param {Object} gsap - GSAP instance
 * @param {HTMLElement} section - Section element
 * @param {number} index - Section index
 */
const setupSectionScrollTrigger = (gsap, section, index) => {
  const strapline = section.querySelector(SELECTORS.strapline);
  const strapline2 = section.querySelector(SELECTORS.strapline2);
  const { animationPhases, initialPositions } = CONFIG;

  const scrollPerSection = window.innerHeight * CONFIG.scrollPerSection;
  const sectionStart = index * scrollPerSection;

  // Initial state
  gsap.set(section, { clipPath: 'inset(100% 0 0 0)' });
  if (strapline) {
    gsap.set(strapline, {
      top: initialPositions.otherSections.straplineTop,
      y: '0',
      scale: 1.1,
    });
  }
  if (strapline2) {
    gsap.set(strapline2, {
      top: initialPositions.otherSections.subtitleTop,
      y: '0',
      opacity: 1,
    });
  }

  // Section reveal animation
  gsap.to(section, {
    clipPath: 'inset(0% 0 0 0)',
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: sectionStart,
      end: sectionStart + (scrollPerSection * animationPhases.reveal),
      scrub: true,
      onEnter: () => updateProgressNav(index),
      onEnterBack: () => updateProgressNav(index),
      onLeaveBack: () => {
        updateProgressNav(index - 1);
        gsap.set(section, { clipPath: 'inset(100% 0 0 0)' });
      },
    },
  });

  // Strapline animation
  if (strapline) {
    gsap.to(strapline, {
      top: initialPositions.finalPositions.straplineTop,
      y: '-50%',
      scale: 0.8,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: sectionStart + (scrollPerSection * animationPhases.straplineStart),
        end: sectionStart + (scrollPerSection * animationPhases.straplineEnd),
        scrub: true,
      },
    });
  }

  // Subtitle animation
  if (strapline2) {
    gsap.to(strapline2, {
      top: initialPositions.finalPositions.subtitleTop,
      y: '-50%',
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: sectionStart + (scrollPerSection * animationPhases.subtitleStart),
        end: sectionStart + (scrollPerSection * animationPhases.straplineEnd),
        scrub: true,
      },
    });
  }
};

/**
 * Initializes parallax cover effect for all sections
 * @param {Object} gsap - GSAP instance
 */
const initParallaxCover = (gsap) => {
  const sections = document.querySelectorAll(SELECTORS.screenSection);
  const container = document.querySelector(SELECTORS.container);
  const { initialPositions } = CONFIG;

  // Set container height for scrolling
  if (container) {
    container.style.height = `${sections.length * CONFIG.scrollPerSection * 100}vh`;
  }

  sections.forEach((section, index) => {
    if (index === 0) {
      // First section: visible, text in position
      updateProgressNav(0);
      gsap.set(section, { clipPath: 'inset(0 0 0 0)' });

      const strapline = section.querySelector(SELECTORS.strapline);
      const strapline2 = section.querySelector(SELECTORS.strapline2);

      if (strapline) {
        gsap.set(strapline, {
          top: initialPositions.firstSection.straplineTop,
          y: '-50%',
          scale: 1,
        });
      }
      if (strapline2) {
        gsap.set(strapline2, {
          top: initialPositions.firstSection.subtitleTop,
          y: '-50%',
          opacity: 1,
        });
      }
      return;
    }

    setupSectionScrollTrigger(gsap, section, index);
  });
};

/**
 * Initializes scroll animations with GSAP
 * @param {Object[]} sections - Section data array
 */
const initScrollAnimations = (sections) => {
  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger) {
    initBasicScroll();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const sectionElements = document.querySelectorAll(SELECTORS.screenSection);
  const navItems = document.querySelectorAll(SELECTORS.progressNavItem);

  // Set background images
  sections.forEach((section, index) => {
    const element = sectionElements[index];
    const bgElement = element?.querySelector(SELECTORS.backgroundImage);

    if (bgElement) {
      const { bgImageSrc } = getSectionImages(section);
      if (bgImageSrc) {
        bgElement.style.backgroundImage = `url(${bgImageSrc})`;
        bgElement.style.display = 'block';
      }
    }
  });

  // Initialize parallax
  initParallaxCover(gsap);

  // Navigation click handlers
  navItems.forEach((li, index) => {
    li.addEventListener('click', () => {
      const target = sectionElements[index];
      if (target) {
        gsap.to(window, {
          duration: 1,
          scrollTo: { y: target, autoKill: false },
          ease: 'power2.inOut',
        });
      }
    });
  });
};

// =============================================================================
// DATA FETCHING
// =============================================================================

/**
 * Fetches and processes slide data from a single slide path
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

    // Extract content
    const textParts = extractTextParts(doc, '.tytul-zdjecia > div > div');
    const backgroundImages = extractImages(doc);

    // Get first image as fallback
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
 * Creates progress navigation element
 * @param {Object[]} sections - Section data array
 * @returns {HTMLElement} - Navigation element
 */
const createProgressNav = (sections) => {
  const nav = document.createElement('ul');
  nav.className = 'progress-nav';

  sections.forEach((section, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${section.title}</span>`;
    if (index === 0) li.classList.add(CLASSES.active);
    nav.appendChild(li);
  });

  return nav;
};

/**
 * Main block decorator function
 * @param {HTMLElement} block - Block element to decorate
 */
export default async function decorate(block) {
  const sections = await fetchScrollHeroData();

  if (!sections.length) {
    block.innerHTML = '<p>No scroll hero sections found.</p>';
    return;
  }

  // Build DOM structure
  const container = document.createElement('div');
  container.className = 'scroll-hero-container';

  sections.forEach((section) => {
    container.appendChild(createSection(section));
  });

  // Render
  block.innerHTML = '';
  block.appendChild(createProgressNav(sections));
  block.appendChild(container);

  // Initialize animations after DOM is ready
  const gsapLoaded = await loadGSAPLibraries();
  if (gsapLoaded && window.gsap && window.ScrollTrigger) {
    initScrollAnimations(sections);
  } else {
    initBasicScroll();
  }
}
