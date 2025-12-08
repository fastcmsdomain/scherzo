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

  // Optimized title parts creation - main-title gets first 2 rows in spans
  const mainTitleParts = section.mainTitleParts?.length ? section.mainTitleParts : [section.title];
  const mainTitleHtml = mainTitleParts
    .map((part, i) => `<span class="title-part title-part-${i}">${part}</span>`)
    .join('');

  // Subtitle gets 3rd and 4th rows in individual spans
  const subtitleParts = section.subtitleParts?.length ? section.subtitleParts : [section.subtitle];
  const subtitleHtml = subtitleParts
    .map((part, i) => `<span class="subtitle-part subtitle-part-${i}">${part}</span>`)
    .join('');

  // Template with minimal whitespace
  sectionDiv.innerHTML = `<div class="pin-spacer"><div class="screen ${section.id.replace('section-', '')} hold-pin"><div class="screen-inner"><div class="background">${bgImagesHtml}</div><div class="fade"></div><div class="strapline"><h1 class="main-title">${mainTitleHtml}</h1></div><div class="strapline-2" style="opacity:1;"><h2 class="subtitle">${subtitleHtml}</h2></div></div></div></div>`;

  return sectionDiv;
};

function createSectionAnimation(section, index, gsap, ScrollTrigger) {
  const sectionSelector = `.${section.id.replace('section-', '')}`;

  // Enhanced timeline based on Wellington College exact pattern
  // Title and subtitle move to center individually, then pause for next slide
  // Calculate initial top position for strapline-2: calc(90% - 40px + 20vh)
  const vh = window.innerHeight;
  const initialTop = (vh * 0.9) - 40 + (vh * 0.2); // 90% - 40px + 20vh

  const timeline = gsap.timeline()
    // Set initial state for strapline-2 to match CSS
    .set(`${sectionSelector} .strapline-2`, {
      top: `${initialTop}px`,
      y: '0',
      scale: 1,
      opacity: 1,
    }, 0)
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
    // Phase 2: strapline-2 animation - move to center of page with progressive opacity
    .to(`${sectionSelector} .strapline-2`, {
      opacity: 1, // Fade in from 0 to 1
      top: '50vh',
      y: '-50%', // Center vertically
      scale: 1.2, // Make it slightly larger for visibility
      duration: 1,
      ease: 'none', // Use 'none' for scrub animations
    }, 0.5) // Start when strapline is halfway to top
    // Phase 3: Fade overlay appears (2x speed)
    .to(`${sectionSelector} .fade`, {
      opacity: 1,
      duration: 0.5,
      ease: 'none', // Use 'none' for scrub animations
    }, 0.1); // Start after subtitle positioning

  // Multiple background images effect
  const backgroundImages = document.querySelectorAll(`${sectionSelector} .background .img`);

  // Background image switching - only after strapline-2 reaches center
  // Strapline-2 animation starts at timeline time 0.5 and reaches center at time 1.0
  const strapline2CenterTime = 1.0; // Timeline time when strapline-2 reaches center

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
    // Smooth reverse behavior and image switching
    onUpdate: () => {
      // Ensure timeline plays smoothly in both directions
      timeline.timeScale(1);

      // Handle background image switching only after strapline-2 reaches center
      if (backgroundImages.length > 1) {
        const currentTime = timeline.time();
        const isStrapline2Centered = currentTime >= strapline2CenterTime;

        if (isStrapline2Centered) {
          // Calculate progress after center (0 to 1)
          const timelineDuration = timeline.duration();
          const remainingTime = timelineDuration - strapline2CenterTime;
          const afterCenterProgress = remainingTime > 0
            ? (currentTime - strapline2CenterTime) / remainingTime
            : 0;

          // Switch images based on progress after center
          backgroundImages.forEach((img, imgIndex) => {
            if (imgIndex === 0) {
              // First image fades out as others appear
              const firstImageFadeStart = 0.2; // Start fading first image after 20% progress
              if (afterCenterProgress >= firstImageFadeStart) {
                const fadeProgress = Math.min(
                  (afterCenterProgress - firstImageFadeStart) / 0.3,
                  1,
                );
                gsap.set(img, { opacity: 1 - fadeProgress });
              } else {
                gsap.set(img, { opacity: 1 });
              }
              return;
            }

            // Distribute remaining images across the remaining scroll
            const imageCount = backgroundImages.length - 1;
            const imageSwitchPoint = (imgIndex - 1) / imageCount;
            const imageFadePoint = (imgIndex - 0.5) / imageCount;

            if (afterCenterProgress >= imageSwitchPoint
              && afterCenterProgress < imageFadePoint) {
              // Show this image
              if (img.style.display === 'none') {
                img.style.display = 'block';
              }
              const showProgress = (afterCenterProgress - imageSwitchPoint)
                / (imageFadePoint - imageSwitchPoint);
              gsap.set(img, { opacity: Math.min(showProgress * 2, 1) });
            } else if (afterCenterProgress >= imageFadePoint
              && imgIndex < backgroundImages.length - 1) {
              // Fade out this image (next one is showing)
              const fadeProgress = (afterCenterProgress - imageFadePoint)
                / (0.5 / imageCount);
              const newOpacity = Math.max(1 - fadeProgress * 2, 0);
              gsap.set(img, { opacity: newOpacity });
              if (newOpacity <= 0) {
                img.style.display = 'none';
              }
            } else if (afterCenterProgress < imageSwitchPoint) {
              // Hide images that haven't reached their switch point yet
              if (img.style.display !== 'none') {
                img.style.display = 'none';
                gsap.set(img, { opacity: 0 });
              }
            }
          });
        } else {
          // Before strapline-2 reaches center, ensure only first image is visible
          backgroundImages.forEach((img, imgIndex) => {
            if (imgIndex === 0) {
              gsap.set(img, { opacity: 1, display: 'block' });
            } else if (img.style.display !== 'none') {
              img.style.display = 'none';
              gsap.set(img, { opacity: 0 });
            }
          });
        }
      }
    },
  });

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

  // Title-part-0 font-size animation - responsive scaling
  // Font size decreases quickly as strapline shifts up
  const titlePart0 = document.querySelector(`${sectionSelector} .title-part-0`);
  if (titlePart0) {
    // Get responsive font sizes based on window width
    const getFontSize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        return 24; // Very small screens
      }
      if (width <= 768) {
        return 27; // Mobile
      }
      if (width <= 992) {
        return 30; // Tablet
      }
      return 36; // Desktop
    };

    const targetFontSize = getFontSize();

    // Animate font-size during scroll - decreased over shorter distance for quicker effect
    gsap.to(`${sectionSelector} .title-part-0`, {
      fontSize: `${targetFontSize}px`,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionSelector,
        start: 'top top',
        end: '+=400vh', // Reduced from 600vh to 200vh for quicker font-size decrease
        scrub: 0.5,
      },
    });
  }

  // Title-part-1 font-size animation - responsive scaling
  // Font size decreases quickly as strapline shifts up
  const titlePart1 = document.querySelector(`${sectionSelector} .title-part-1`);
  if (titlePart1) {
    // Get responsive font sizes based on window width
    // Title-part-1 is smaller than title-part-0 (proportional decrease)
    const getFontSize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        return 14; // Very small screens - proportional to title-part-0
      }
      if (width <= 768) {
        return 16; // Mobile - proportional to title-part-0
      }
      if (width <= 992) {
        return 18; // Tablet - proportional to title-part-0
      }
      return 14; // Desktop - proportional to title-part-0
    };

    const targetFontSize = getFontSize();

    // Animate font-size during scroll - decreased over shorter distance for quicker effect
    gsap.to(`${sectionSelector} .title-part-1`, {
      fontSize: `${targetFontSize}px`,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionSelector,
        start: 'top top',
        end: '+=400vh', // Same scroll distance as title-part-0
        scrub: 0.5,
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
