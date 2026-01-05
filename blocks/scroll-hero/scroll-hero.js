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

/**
 * Video Modal Utilities
 * Handles opening videos in a fullscreen modal popup
 */
const videoModalUtils = {
  // Video URL patterns for detection
  patterns: {
    youtube: /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    vimeo: /vimeo\.com\/(?:video\/)?(\d+)/,
    directVideo: /\.(mp4|webm|ogg)(\?.*)?$/i,
  },

  /**
   * Check if URL is a video link
   * @param {string} url - URL to check
   * @returns {Object|null} - Video info or null
   */
  getVideoInfo(url) {
    if (!url) return null;

    // Check YouTube
    const youtubeMatch = url.match(this.patterns.youtube);
    if (youtubeMatch) {
      return { type: 'youtube', id: youtubeMatch[1], url };
    }

    // Check Vimeo
    const vimeoMatch = url.match(this.patterns.vimeo);
    if (vimeoMatch) {
      return { type: 'vimeo', id: vimeoMatch[1], url };
    }

    // Check direct video files
    if (this.patterns.directVideo.test(url)) {
      return { type: 'direct', url };
    }

    return null;
  },

  /**
   * Create video embed HTML based on type
   * @param {Object} videoInfo - Video information object
   * @returns {string} - HTML string for video embed
   */
  createVideoEmbed(videoInfo) {
    const { type, id, url } = videoInfo;

    switch (type) {
      case 'youtube':
        return `<iframe 
          src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>`;
      case 'vimeo':
        return `<iframe 
          src="https://player.vimeo.com/video/${id}?autoplay=1" 
          frameborder="0" 
          allow="autoplay; fullscreen; picture-in-picture" 
          allowfullscreen>
        </iframe>`;
      case 'direct':
        return `<video src="${url}" controls autoplay>
          Your browser does not support the video tag.
        </video>`;
      default:
        return '';
    }
  },

  /**
   * Open video modal
   * @param {string} videoUrl - URL of the video
   */
  openModal(videoUrl) {
    const videoInfo = this.getVideoInfo(videoUrl);
    if (!videoInfo) return;

    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'scroll-hero-video-modal';
    modal.innerHTML = `
      <div class="video-modal-overlay"></div>
      <div class="video-modal-content">
        <button class="video-modal-close" aria-label="Close video">
          <span>&times;</span>
        </button>
        <div class="video-modal-player">
          ${this.createVideoEmbed(videoInfo)}
        </div>
      </div>
    `;

    // Add to DOM
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
    });

    // Close handlers
    const closeModal = () => {
      modal.classList.remove('is-open');
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = '';
      }, 300);
    };

    // Close on X button click
    modal.querySelector('.video-modal-close').addEventListener('click', closeModal);

    // Close on overlay click
    modal.querySelector('.video-modal-overlay').addEventListener('click', closeModal);

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  },

  /**
   * Initialize video button handlers
   * @param {HTMLElement} container - Container element to search for video buttons
   */
  initVideoButtons(container) {
    const buttons = container.querySelectorAll('.scroll-hero-button');

    buttons.forEach((button) => {
      const href = button.getAttribute('href');
      const videoInfo = this.getVideoInfo(href);

      if (videoInfo) {
        // Mark as video button
        button.classList.add('is-video-button');

        // Prevent default and open modal
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.openModal(href);
        });
      }
    });
  },
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

  // Subtitle parts - use HTML parts if available (preserves buttons)
  const subtitlePartsToUse = section.subtitleHtmlParts?.length
    ? section.subtitleHtmlParts
    : (section.subtitleParts?.length ? section.subtitleParts : [section.subtitle]);
  const subtitleHtml = subtitlePartsToUse
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
 * Text on first and second slide is static, text on other slides animates
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

    // Second section - static text (like first slide), no text animations
    if (index === 1) {
      // Set static positions for second slide
      if (strapline) {
        gsap.set(strapline, { top: '50%', y: '-50%' });
      }
      if (strapline2) {
        gsap.set(strapline2, { top: '52%', opacity: 1 });
      }
      return;
    }

    // Text animation for subsequent slides (3rd and beyond)
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
        top: '10%',
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

          // Check for links in subtitle rows (3rd and 4th elements) - preserve HTML
          const subtitleElements = Array.from(textElements).slice(2, 4);
          const subtitleHtmlParts = subtitleElements.map((el) => {
            const link = el.querySelector('a');
            if (link) {
              // Convert link to button
              const href = link.getAttribute('href');
              const text = link.textContent.trim();
              return `<a href="${href}" class="scroll-hero-button">${text}</a>`;
            }
            return el.textContent.trim();
          }).filter((text) => text);

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
            subtitleHtmlParts, // HTML parts with buttons preserved
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

  // Initialize video button handlers
  videoModalUtils.initVideoButtons(block);

  // Initialize animations after DOM is ready
  setTimeout(async () => {
    await initializeAnimations(sections);
  }, 100);
}
