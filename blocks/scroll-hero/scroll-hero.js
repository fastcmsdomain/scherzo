/**
 * Scroll Hero Block - Franklin Component
 * Recreates Wellington College Prep scroll animation with GSAP ScrollTrigger
 */

// Utility functions
function getWindowWidth() {
  return window.innerWidth || document.documentElement.clientWidth;
}

function updateProgressNav(activeIndex) {
  document.querySelectorAll('.progress-nav li').forEach((li, index) => {
    li.classList.toggle('isActive', index === activeIndex);
  });
}

function clearProgressNav() {
  document.querySelectorAll('.progress-nav li').forEach((li) => {
    li.classList.remove('isActive');
  });
}

// GSAP loading functions
function loadGSAP() {
  return new Promise((resolve, reject) => {
    if (window.gsap) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.onload = () => {
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadScrollTrigger() {
  return new Promise((resolve, reject) => {
    if (window.ScrollTrigger) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
    script.onload = () => {
      if (window.gsap) {
        window.gsap.registerPlugin(window.ScrollTrigger);
      }
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadScrollToPlugin() {
  return new Promise((resolve, reject) => {
    if (window.gsap && window.gsap.plugins && window.gsap.plugins.ScrollToPlugin) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollToPlugin.min.js';
    script.onload = () => {
      if (window.gsap) {
        window.gsap.registerPlugin(window.ScrollToPlugin);
      }
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function initBasicScroll(sections) {
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

function createSection(section) {
  const sectionDiv = document.createElement('div');
  sectionDiv.className = `screen-section ${section.id}`;
  
  // Use backgroundImages array from query-index.json data
  const backgroundImages = section.backgroundImages || [section.image];
  const bgImagesHtml = backgroundImages.map((img, imgIndex) => 
    `<div class="img image-bg image-bg-${imgIndex}" data-bg="${img}" style="display: ${imgIndex === 0 ? 'block' : 'none'}"></div>`
  ).join('');
  
  // Create title parts HTML from titleParts array
  const titlePartsHtml = section.titleParts && section.titleParts.length > 0 
    ? section.titleParts.map((part, partIndex) => 
        `<span class="title-part title-part-${partIndex}">${part}</span>`
      ).join('')
    : `<span class="title-part title-part-0">${section.title}</span>`;
  
  sectionDiv.innerHTML = `
    <div class="pin-spacer">
      <div class="screen ${section.id.replace('section-', '')} hold-pin">
        <div class="screen-inner">
          <div class="background">
            ${bgImagesHtml}
          </div>
          <div class="fade"></div>
          <div class="strapline">
            <h5 class="time-indicator">${section.time}</h5>
            <h1 class="main-title">
              ${titlePartsHtml}
            </h1>
            <h2 class="subtitle">${section.subtitle}</h2>
          </div>
          <div class="strapline-advanced">
            <h2 class="advanced-title">${section.title}</h2>
            <p class="description">${section.description}</p>
          </div>
          <div class="strapline-bottom">
            <a href="#stories">Latest #${section.title}ForLife Stories</a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return sectionDiv;
}

async function initializeAnimations(sections) {
  // Ensure GSAP and ScrollTrigger are loaded
  try {
    if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
      await loadGSAP();
      await loadScrollTrigger();
      await loadScrollToPlugin();
    }
    
    initScrollAnimations(sections);
  } catch (error) {
    // Fallback to basic scroll behavior
    initBasicScroll(sections);
  }
}

function initScrollAnimations(sections) {
  // Use window.gsap and window.ScrollTrigger to avoid undefined errors
  const { gsap, ScrollTrigger } = window;
  
  if (!gsap || !ScrollTrigger) {
    initBasicScroll(sections);
    return;
  }
  
  gsap.registerPlugin(ScrollTrigger);
  
  // Set background images for all sections
  sections.forEach((section) => {
    const sectionElement = document.querySelector(`.screen-section.${section.id}`);
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

  // Progress navigation clicks (smooth scroll like Wellington College)
  document.querySelectorAll('.progress-nav li').forEach((li, index) => {
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

function createSectionAnimation(section, index, gsap, ScrollTrigger) {
  const sectionSelector = `.${section.id.replace('section-', '')}`;
  
  // Enhanced timeline based on Wellington College exact pattern
  const timeline = gsap.timeline()
    .to(`${sectionSelector} .strapline`, {
      top: 60,
      y: 0,
      delay: 0.1,
      ease: 'power2.out',
    }, 0)
    .to(`${sectionSelector} .strapline .main-title`, {
      fontSize: getWindowWidth() < 992 ? '44px' : '66px',
      delay: 0.1,
      ease: 'power2.out',
    }, 0)
    .to(`${sectionSelector} .strapline .time-indicator`, {
      opacity: 0,
      duration: 0.1,
      delay: 0.1,
    }, 0)
    .to(`${sectionSelector} .strapline .subtitle`, {
      top: -35,
      fontSize: '12px',
      delay: 0.1,
      ease: 'power2.out',
    }, 0)
    .to(`${sectionSelector} .fade`, {
      opacity: 1,
      ease: 'power2.inOut',
    }, 0)
    .to(`${sectionSelector} .strapline-advanced`, {
      top: '50%',
      yPercent: -50,
      delay: 0.2,
      ease: 'power2.out',
    }, 0)
    .to(`${sectionSelector} .strapline-advanced`, {
      bottom: '26%',
      delay: 0.2,
    }, 0)
    .to(`${sectionSelector} .strapline-bottom`, {
      bottom: getWindowWidth() < 992 ? '48px' : '0%',
      delay: 0.3,
      ease: 'power2.out',
    }, 0);

  // Create ScrollTrigger for this section (exact Wellington College setup)
  ScrollTrigger.create({
    trigger: `${sectionSelector}`,
    start: 'top top',
    pin: true,
    pinSpacing: false,
    animation: timeline,
    scrub: 1,
    onEnter: () => updateProgressNav(index),
    onEnterBack: () => updateProgressNav(index),
    onLeave: () => clearProgressNav(),
    onLeaveBack: () => clearProgressNav(),
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
  
  // Parallax effect for all background images
  backgroundImages.forEach((img, imgIndex) => {
    gsap.to(img, {
      yPercent: -30 - (imgIndex * 10),
      scale: 1 + (imgIndex * 0.05),
      ease: 'none',
      scrollTrigger: {
        trigger: sectionSelector,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2 + (imgIndex * 0.3),
      },
    });
  });

  // Text entrance animation
  gsap.fromTo(`${sectionSelector} .strapline`, {
    y: 100,
    opacity: 0,
    scale: 0.9,
  }, {
    y: 0,
    opacity: 1,
    scale: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: sectionSelector,
      start: 'top 80%',
      end: 'top 50%',
      scrub: 1,
    },
  });

  // Text exit animation
  gsap.to(`${sectionSelector} .strapline`, {
    y: -150,
    opacity: 0.2,
    scale: 0.7,
    ease: 'none',
    scrollTrigger: {
      trigger: sectionSelector,
      start: 'center top',
      end: 'bottom top',
      scrub: 1.5,
    },
  });

  // Advanced strapline entrance
  gsap.fromTo(`${sectionSelector} .strapline-advanced`, {
    y: 200,
    opacity: 0,
  }, {
    y: 0,
    opacity: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: sectionSelector,
      start: 'top 30%',
      end: 'center center',
      scrub: 1,
    },
  });

  // Scale effect for depth during overlap
  gsap.fromTo(`${sectionSelector}`, {
    scale: 0.95,
    filter: 'brightness(0.8)',
  }, {
    scale: 1,
    filter: 'brightness(1)',
    ease: 'none',
    scrollTrigger: {
      trigger: sectionSelector,
      start: 'top bottom',
      end: 'top top',
      scrub: 1,
    },
  });

  // Individual title parts animation
  const mainTitleParts = document.querySelectorAll(`${sectionSelector} .title-part`);
  if (mainTitleParts.length > 0) {
    gsap.fromTo(mainTitleParts, {
      y: 100,
      opacity: 0,
      scale: 0.8,
      rotationX: 15,
    }, {
      y: 0,
      opacity: 1,
      scale: 1,
      rotationX: 0,
      duration: 0.8,
      ease: 'power2.out',
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
            imageSrc = imageSrc.split('?')[0];
          }
          const absoluteImageSrc = imageSrc ? new URL(imageSrc, window.location.origin).href : '';

          // Extract additional images for multi-image effect
          const allImages = doc.querySelectorAll('picture source[media="(min-width: 600px)"]');
          const backgroundImages = Array.from(allImages).map((img) => {
            const src = img.getAttribute('srcset').split('?')[0];
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