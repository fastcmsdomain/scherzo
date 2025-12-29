/**
 * Scroll Hero Block - Franklin Component
 * Recreates Wellington College Prep scroll animation with GSAP ScrollTrigger
 */

// Optimized utility functions

const updateProgressNav = (activeIndex) => {
  const navItems = document.querySelectorAll('.progress-nav li');
  navItems.forEach((li, index) => li.classList.toggle('isActive', index === activeIndex));
};

const clearProgressNav = () => {
  const navItems = document.querySelectorAll('.progress-nav li');
  navItems.forEach((li) => li.classList.remove('isActive'));
};

// Optimized GSAP loading
const loadScript = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = resolve;
  script.onerror = reject;
  document.head.appendChild(script);
});

const loadGSAPLibraries = async () => {
  const baseURL = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/';

  try {
    // Load GSAP core if not already loaded
    if (!window.gsap) {
      await loadScript(`${baseURL}gsap.min.js`);
    }

    // Load ScrollTrigger if not already loaded
    if (!window.ScrollTrigger) {
      await loadScript(`${baseURL}ScrollTrigger.min.js`);
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    // Load ScrollToPlugin if not already loaded
    if (!window.gsap?.plugins?.ScrollToPlugin) {
      await loadScript(`${baseURL}ScrollToPlugin.min.js`);
      window.gsap.registerPlugin(window.ScrollToPlugin);
    }

    return true;
  } catch (error) {
    // Failed to load GSAP libraries
    return false;
  }
};

function initBasicScroll() {
  // Fallback for when GSAP is not available

  // Simple scroll behavior without animations
  document.querySelectorAll('.progress-nav li').forEach((li, index) => {
    li.addEventListener('click', () => {
      const targetSection = document.querySelector(`.screen-section:nth-child(${index + 1}) .screen`);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Basic intersection observer for progress navigation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionIndex = Array.from(document.querySelectorAll('.screen-section')).indexOf(entry.target);
        updateProgressNav(sectionIndex);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.screen-section').forEach((section) => {
    observer.observe(section);
  });
}

/**
 * Creates a section element with parallax cover structure
 * @param {Object} section - Section data object
 * @returns {HTMLElement} - Section DOM element
 */
const createSection = (section) => {
  const sectionDiv = document.createElement('div');
  sectionDiv.className = `screen-section ${section.id}`;

  // Only use first background image for parallax cover effect
  const backgroundImages = section.backgroundImages || [section.image];
  const bgImagesHtml = backgroundImages
    .map((img, i) => `<div class="img image-bg image-bg-${i}" data-bg="${img}" ${i > 0 ? 'style="display:none"' : ''}></div>`)
    .join('');

  // Main title parts
  const mainTitleParts = section.mainTitleParts?.length ? section.mainTitleParts : [section.title];
  const mainTitleHtml = mainTitleParts
    .map((part, i) => `<span class="title-part title-part-${i}">${part}</span>`)
    .join('');

  // Subtitle parts
  const subtitleParts = section.subtitleParts?.length ? section.subtitleParts : [section.subtitle];
  const subtitleHtml = subtitleParts
    .map((part, i) => `<span class="subtitle-part subtitle-part-${i}">${part}</span>`)
    .join('');

  // Simplified structure for parallax cover effect
  sectionDiv.innerHTML = `
    <div class="screen ${section.id.replace('section-', '')}">
      <div class="screen-inner">
        <div class="background">${bgImagesHtml}</div>
        <div class="fade"></div>
        <div class="strapline">
          <h1 class="main-title">${mainTitleHtml}</h1>
        </div>
        <div class="strapline-2">
          <h2 class="subtitle">${subtitleHtml}</h2>
        </div>
      </div>
    </div>
  `;

  return sectionDiv;
};

/**
 * Initializes the simple parallax cover effect
 * Each section slides over the previous one when scrolling
 * Text on first slide is static, text on other slides animates
 * @param {Object} gsap - GSAP instance
 * @param {Object} ScrollTrigger - ScrollTrigger instance
 * @param {number} totalSections - Total number of sections
 */
function initParallaxCover(gsap, ScrollTrigger, totalSections) {
  const sections = document.querySelectorAll('.screen-section');

  sections.forEach((section, index) => {
    const sectionSelector = `.screen-section:nth-child(${index + 1})`;
    const strapline = section.querySelector('.strapline');
    const strapline2 = section.querySelector('.strapline-2');

    // First section - static text, no animations
    if (index === 0) {
      updateProgressNav(0);
      return;
    }

    // Each subsequent section slides up from bottom to cover the previous one
    gsap.fromTo(
      section,
      { yPercent: 100 },
      {
        yPercent: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
          onEnter: () => updateProgressNav(index),
          onEnterBack: () => updateProgressNav(index),
          onLeaveBack: () => updateProgressNav(index - 1),
        },
      },
    );

    // Text animation for subsequent slides
    // Text starts at bottom (90%) and moves to center (50%) then to top (10%)
    if (strapline) {
      // Initial position - text at bottom
      gsap.set(strapline, { top: '80%', y: '-50%' });

      // Animate text from bottom to center as section enters
      gsap.to(strapline, {
        top: '50%',
        y: '-50%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      });

      // Then animate from center to top as user continues scrolling
      gsap.to(strapline, {
        top: '15%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=50%',
          scrub: true,
        },
      });
    }

    // Subtitle animation - follows main title but slightly delayed
    if (strapline2) {
      // Initial position - subtitle below main title at bottom
      gsap.set(strapline2, { top: '95%', y: '0', opacity: 0 });

      // Animate subtitle: fade in and move to center
      gsap.to(strapline2, {
        top: '60%',
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 50%',
          end: 'top top',
          scrub: true,
        },
      });

      // Then animate to top following main title
      gsap.to(strapline2, {
        top: '28%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=50%',
          scrub: true,
        },
      });
    }
  });
}

/**
 * Initializes parallax cover scroll animations
 * @param {Array} sections - Array of section data objects
 */
const initScrollAnimations = (sections) => {
  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger) {
    initBasicScroll();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Batch DOM operations for better performance
  const sectionElements = document.querySelectorAll('.screen-section');
  const navItems = document.querySelectorAll('.progress-nav li');
  const totalSections = sections.length;

  // Set background images efficiently
  sections.forEach((section, sectionIndex) => {
    const sectionElement = sectionElements[sectionIndex];
    if (!sectionElement) return;

    // Use only the first background image
    const bgElement = sectionElement.querySelector('.image-bg-0');
    if (bgElement && section.backgroundImages && section.backgroundImages[0]) {
      bgElement.style.backgroundImage = `url(${section.backgroundImages[0]})`;
      bgElement.style.display = 'block';
    }
  });

  // Initialize the simple parallax cover effect
  initParallaxCover(gsap, ScrollTrigger, totalSections);

  // Progress navigation click handlers
  if (navItems.length > 0) {
    navItems.forEach((li, index) => {
      li.addEventListener('click', () => {
        const targetSection = sectionElements[index];
        if (targetSection) {
        gsap.to(window, {
          duration: 1,
            scrollTo: { y: targetSection, autoKill: false },
          ease: 'power2.inOut',
        });
        }
      });
    });
  }
};

// Optimized initialization
const initializeAnimations = async (sections) => {
  const gsapLoaded = await loadGSAPLibraries();

  if (gsapLoaded && window.gsap && window.ScrollTrigger) {
    initScrollAnimations(sections);
  } else {
    // GSAP failed to load, using basic scroll fallback
    initBasicScroll();
  }
};

export default async function decorate(block) {
  // Fetch slides data from query-index.json (like slide-builder)
  async function fetchScrollHeroData() {
    try {
      const response = await fetch('/slides/query-index.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonFeed = await response.json();

      if (!jsonFeed.data || !Array.isArray(jsonFeed.data)) {
        throw new Error('Invalid data format in JSON feed');
      }

      const processedSections = await Promise.all(jsonFeed.data.map(async (item) => {
        if (!item.path || !item.path.startsWith('/slides/')) {
          return null;
        }

        try {
          const htmlResponse = await fetch(`${item.path}.plain.html`);
          if (!htmlResponse.ok) {
            throw new Error(`Failed to fetch HTML for slide: ${item.path}`);
          }
          const html = await htmlResponse.text();

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          // Extract title parts with specific row handling
          const textElements = doc.querySelectorAll('.tytul-zdjecia > div > div');
          const allTextParts = Array.from(textElements)
            .map((el) => el.textContent.trim())
            .filter((text) => text);

          // Split into main-title (first 2 rows) and subtitle (3rd and 4th rows)
          const mainTitleParts = allTextParts.slice(0, 2); // First 2 rows
          const subtitleParts = allTextParts.slice(2, 4); // 3rd and 4th rows

          // Extract image (same as slide-builder)
          const imgElement = doc.querySelector('picture source[media="(min-width: 600px)"]');
          let imageSrc = '';
          if (imgElement) {
            imageSrc = imgElement.getAttribute('srcset');
            [imageSrc] = imageSrc.split('?');
          }
          const absoluteImageSrc = imageSrc ? new URL(imageSrc, window.location.origin).href : '';

          // Extract additional images for multi-image effect
          const allImages = doc.querySelectorAll('picture source[media="(min-width: 600px)"]');
          const backgroundImages = Array.from(allImages).map((img) => {
            const [src] = img.getAttribute('srcset').split('?');
            return new URL(src, window.location.origin).href;
          });

          // Extract description and time from metadata or content
          const descriptionElement = doc.querySelector('.description, .subtitle, p');
          const timeElement = doc.querySelector('.time, .timestamp');

          return {
            ...item,
            id: `section-${item.path.split('/').pop()}`,
            mainTitleParts,
            subtitleParts,
            title: mainTitleParts[0] || item.title,
            subtitle: subtitleParts.join(' '),
            description: descriptionElement ? descriptionElement.textContent.trim() : '',
            time: timeElement ? timeElement.textContent.trim() : '00:00',
            backgroundImages: backgroundImages.length > 0 ? backgroundImages : [absoluteImageSrc],
            image: absoluteImageSrc,
          };
        } catch (error) {
          return null;
        }
      }));

      return processedSections.filter((slide) => slide !== null);
    } catch (error) {
      return [];
    }
  }

  // Fetch the sections data
  const sections = await fetchScrollHeroData();

  if (!sections || sections.length === 0) {
    block.innerHTML = '<p>No scroll hero sections found.</p>';
    return;
  }

  // Create the main container structure
  const heroContainer = document.createElement('div');
  heroContainer.className = 'scroll-hero-container';

  // Clear the original block content
  block.innerHTML = '';

  // Create progress navigation
  const progressNav = document.createElement('ul');
  progressNav.className = 'progress-nav';
  sections.forEach((section, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${section.title}</span>`;
    if (index === 0) li.classList.add('isActive');
    progressNav.appendChild(li);
  });

  // Create sections
  sections.forEach((section) => {
    const sectionElement = createSection(section);
    heroContainer.appendChild(sectionElement);
  });

  // Append to block
  block.appendChild(progressNav);
  block.appendChild(heroContainer);

  // Initialize animations after DOM is ready
  setTimeout(async () => {
    await initializeAnimations(sections);
  }, 100);
}
