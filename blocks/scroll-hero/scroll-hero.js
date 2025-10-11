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

// Optimized section creation
const createSection = (section) => {
  const sectionDiv = document.createElement('div');
  sectionDiv.className = `screen-section ${section.id}`;

  // Optimized background images creation
  const backgroundImages = section.backgroundImages || [section.image];
  const bgImagesHtml = backgroundImages
    .map((img, i) => `<div class="img image-bg image-bg-${i}" data-bg="${img}" ${i > 0 ? 'style="display:none"' : ''}></div>`)
    .join('');

  // Optimized title parts creation
  const titleParts = section.titleParts?.length ? section.titleParts : [section.title];
  const titlePartsHtml = titleParts
    .map((part, i) => `<span class="title-part title-part-${i}">${part}</span>`)
    .join('');

  // Template with minimal whitespace
  sectionDiv.innerHTML = `<div class="pin-spacer"><div class="screen ${section.id.replace('section-', '')} hold-pin"><div class="screen-inner"><div class="background">${bgImagesHtml}</div><div class="fade"></div><div class="strapline"><h5 class="time-indicator">${section.time}</h5><h1 class="main-title">${titlePartsHtml}</h1><h2 class="subtitle">${section.subtitle}</h2></div></div></div></div>`;

  return sectionDiv;
};

function createSectionAnimation(section, index, gsap, ScrollTrigger) {
  const sectionSelector = `.${section.id.replace('section-', '')}`;

  // Enhanced timeline based on Wellington College exact pattern
  // Title and subtitle move to center individually, then pause for next slide
  const timeline = gsap.timeline()
    // Phase 0: Ensure strapline is visible throughout scroll
    .to(`${sectionSelector} .strapline`, {
      opacity: 1,
      duration: 0.1,
      ease: 'power2.out',
    }, 0)
    // Phase 1: Move strapline container and all text elements together
    .to(`${sectionSelector} .strapline`, {
      top: '4rem',
      y: '0',
      duration: 1, // Duration doesn't matter with scrub - controlled by scroll
      ease: 'none', // Use 'none' for scrub animations
    }, 0)
    // Phase 2: Text elements move together (font sizes controlled by CSS)
    // No font size animations - handled by CSS media queries
    // Phase 3: Fade overlay appears
    .to(`${sectionSelector} .fade`, {
      opacity: 1,
      duration: 1,
      ease: 'none', // Use 'none' for scrub animations
    }, 0.6); // Start after subtitle positioning

  // Create ScrollTrigger with smooth reverse scrolling - with CSS offset spacing
  ScrollTrigger.create({
    trigger: `${sectionSelector}`,
    start: 'top top',
    end: '+=600vh', // Reduced since CSS margin-bottom creates the delay
    pin: true,
    pinSpacing: false,
    animation: timeline,
    scrub: 0.5, // Balanced scrub for smooth control
    onEnter: () => updateProgressNav(index),
    onEnterBack: () => updateProgressNav(index),
    onLeave: () => clearProgressNav(),
    onLeaveBack: () => clearProgressNav(),
    // Smooth reverse behavior
    onUpdate: () => {
      // Ensure timeline plays smoothly in both directions
      timeline.timeScale(1);
    },
  });

  // Multiple background images effect
  const backgroundImages = document.querySelectorAll(`${sectionSelector} .background .img`);

  // Background image switching during scroll (Wellington College pattern)
  if (backgroundImages.length > 1) {
    backgroundImages.forEach((img, imgIndex) => {
      if (imgIndex === 0) return; // First image is always visible

      ScrollTrigger.create({
        trigger: sectionSelector,
        start: `${25 + (imgIndex * 25)}% center`,
        end: `${50 + (imgIndex * 25)}% center`,
        onEnter: () => {
          gsap.to(img, { display: 'block', opacity: 1, duration: 0.5 });
        },
        onLeave: () => {
          gsap.to(img, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
              img.style.display = 'none';
            },
          });
        },
        onEnterBack: () => {
          gsap.to(img, { display: 'block', opacity: 1, duration: 0.5 });
        },
        onLeaveBack: () => {
          gsap.to(img, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
              img.style.display = 'none';
            },
          });
        },
      });
    });
  }

  // Keep background images static - no parallax effect
  // Images remain fixed while text overlays shift up

  // Text entrance animation removed - handled by main timeline
  // The main timeline controls strapline visibility and positioning

  // Text exit animation - let h1 and h2 stay at top before exiting
  gsap.to(`${sectionSelector} .strapline`, {
    y: -400, // Move much further up to completely exit screen
    opacity: 0, // Fade out completely
    ease: 'none',
    scrollTrigger: {
      trigger: sectionSelector,
      start: '60% top', // Start earlier since CSS spacing creates the delay
      end: '90% top', // Complete exit before section ends
      scrub: 1, // Smooth exit
    },
  });

  // Brightness effect for depth during overlap (no scale)
  gsap.fromTo(`${sectionSelector}`, {
    filter: 'brightness(0.8)',
  }, {
    filter: 'brightness(1)',
    ease: 'none',
    scrollTrigger: {
      trigger: sectionSelector,
      start: 'top bottom',
      end: 'top top',
      scrub: 1,
    },
  });

  // Individual title parts animation with reverse scrolling (no scale)
  const mainTitleParts = document.querySelectorAll(`${sectionSelector} .title-part`);
  if (mainTitleParts.length > 0) {
    gsap.fromTo(mainTitleParts, {
      y: 100,
      opacity: 0,
      rotationX: 15,
    }, {
      y: 0,
      opacity: 1,
      rotationX: 0,
      ease: 'none', // Use 'none' for scrub animations
      stagger: 0.15,
      scrollTrigger: {
        trigger: sectionSelector,
        start: 'top 80%',
        end: 'top 50%',
        scrub: 1,
      },
    });
  }
}

// Optimized scroll animations initialization
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

  // Set background images efficiently
  sections.forEach((section, sectionIndex) => {
    const sectionElement = sectionElements[sectionIndex];
    if (sectionElement && section.backgroundImages) {
      section.backgroundImages.forEach((img, imgIndex) => {
        const bgElement = sectionElement.querySelector(`.image-bg-${imgIndex}`);
        if (bgElement) {
          bgElement.style.backgroundImage = `url(${img})`;
        }
      });
    }
  });

  // Create animations for each section
  sections.forEach((section, index) => {
    createSectionAnimation(section, index, gsap, ScrollTrigger);
  });

  // Optimized progress navigation with event delegation
  if (navItems.length > 0) {
    navItems.forEach((li, index) => {
      li.addEventListener('click', () => {
        const targetSection = `.screen-section:nth-child(${index + 1}) .screen`;
        gsap.to(window, {
          duration: 1,
          scrollTo: targetSection,
          ease: 'power2.inOut',
        });
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

          // Extract title parts (same as slide-builder)
          const textElements = doc.querySelectorAll('.tytul-zdjecia > div > div');
          const titleParts = Array.from(textElements)
            .map((el) => el.textContent.trim())
            .filter((text) => text);

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
            titleParts,
            title: titleParts[0] || item.title || 'Section',
            subtitle: titleParts[1] || 'for life',
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
